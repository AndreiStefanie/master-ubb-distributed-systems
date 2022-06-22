import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.StringTokenizer;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.FileSplit;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class InvertedIndex {

	public static class InvertedIndexMapper extends Mapper<Object, Text, Object, Text> {
		private Text keyInfo = new Text();
		private Text valueInfo = new Text();
		private String currentFile = "";
		private Integer rowCount = 0;

		public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
			// Use split to get the current chunk name
			FileSplit split = (FileSplit) context.getInputSplit();
			String newFile = split.getPath().getName();

			// Read stop-words from file and convert to Array
			InputStream is = this.getClass().getResourceAsStream("/stopwords.txt");
			ArrayList<String> stopWords = new ArrayList<>();
			try (BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
				while (br.ready()) {
					stopWords.add(br.readLine());
				}
			}

			// Split input by end of line
			StringTokenizer itr1 = new StringTokenizer(value.toString(), "\n");

			while (itr1.hasMoreTokens()) {
				if (newFile.equals(currentFile)) {
					rowCount++;
				} else {
					rowCount = 1;
					currentFile = newFile;
				}

				String line = itr1.nextToken();
				// Split input by separators
				StringTokenizer itr2 = new StringTokenizer(line, "\"\',.()?![]#$*-;:_+/\\<>@%& ");

				while (itr2.hasMoreTokens()) {
					String word = itr2.nextToken();
					if (!stopWords.contains(word)) {
						// format: (word:file, value)
						keyInfo.set(word.toLowerCase() + ":" + newFile);
						valueInfo.set(rowCount.toString());
						context.write(keyInfo, valueInfo);
					}
				}
			}
		}
	}

	public static class InvertedIndexCombiner extends Reducer<Text, Text, Text, Text> {
		private Text info = new Text();

		protected void reduce(Text key, Iterable<Text> values, Context context)
				throws IOException, InterruptedException {

			// format: (word, (file, line, line...))
			String lines = "";
			for (Text value : values) {
				lines += value.toString() + ", ";
			}

			lines = lines.substring(0, lines.length() - 2); // Remove last ", "

			String[] keySplit = key.toString().split(":");
			String word = keySplit[0];
			String page = keySplit[1];

			info.set("(" + page + ", " + lines + ")");
			key.set(word);
			context.write(key, info);
		}
	}

	public static class InvertedIndexReducer extends Reducer<Text, Text, Text, Text> {

		private Text result = new Text();

		protected void reduce(Text key, Iterable<Text> values, Context context)
				throws IOException, InterruptedException {

			// format: (word, (file, line, line,...); (file, line, line...);...)
			String fileList = new String();
			for (Text value : values) {
				fileList += value.toString() + "; ";
			}

			fileList = fileList.substring(0, fileList.length() - 2); // Remove last "; "

			result.set(fileList);
			context.write(key, result);
		}

	}

	public static void main(String[] args) throws Exception {
		Configuration conf = new Configuration();
		Job job = Job.getInstance(conf, "inverted index");

		job.setJarByClass(InvertedIndex.class);
		job.setMapperClass(InvertedIndexMapper.class);
		job.setCombinerClass(InvertedIndexCombiner.class);
		job.setReducerClass(InvertedIndexReducer.class);
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(Text.class);

		FileInputFormat.addInputPath(job, new Path(args[0]));
		FileOutputFormat.setOutputPath(job, new Path(args[1]));

		System.exit(job.waitForCompletion(true) ? 0 : 1);
	}
}