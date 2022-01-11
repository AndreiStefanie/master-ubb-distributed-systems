import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split


def get_play_data():
    user_behavior = pd.read_csv(
        "data\\steam-200k.csv", header=None).drop(columns=4)
    user_behavior.columns = ["user_id", "game_name", "behavior", "amount"]

    # get only play interactions
    user_plays = user_behavior[user_behavior["behavior"] == "play"].drop(
        columns="behavior")

    # make sure each user only has one play amount for each game
    user_plays = user_plays.groupby(
        ["user_id", "game_name"]).sum().reset_index()

    return user_plays


def play_minimum(plays, threshold):
    games_played = plays.groupby("user_id").count().reset_index()
    games_played = games_played[(games_played['amount'] >= threshold)]
    new_plays = plays.merge(games_played['user_id'], on='user_id')

    return new_plays


def drop_unplayed_or_too_popular(plays, lower_thresh, upper_thresh):
    users_played = plays.groupby("game_name").count().reset_index()
    users_played = users_played[(users_played['amount'] >= lower_thresh) &
                                (users_played['amount'] <= upper_thresh)]
    new_plays = plays.merge(users_played['game_name'], on='game_name')

    return new_plays


def min_max_norm(plays):
    new_plays = plays.merge(plays.groupby('game_name').agg(
        {'amount': 'min'}).reset_index(), on='game_name')
    new_plays = new_plays.merge(new_plays.groupby('game_name').agg(
        {'amount_x': 'max'}).reset_index(), on='game_name')
    new_plays.columns = ['user_id', 'game_name', 'amount', 'min', 'max']
    new_plays['norm_amount'] = (new_plays['amount'] - new_plays['min'].apply(
        np.floor)) / (new_plays['max'] - new_plays['min'].apply(np.floor))

    return new_plays.drop(columns=['min', 'max'])


def main():
    plays = get_play_data()
    print("Read in data: {}".format(plays.shape[0]))

    # remove games that more than 300 people have played or less than 10
    plays = drop_unplayed_or_too_popular(plays, 10, 300)
    print("Removed too popular games: {}".format(plays.shape[0]))

    # only keep users that played at least 2 games
    plays = play_minimum(plays, 2)
    print("Removed users with few played games: {}".format(plays.shape[0]))

    # normalize the play amounts by the users min and max play times per game
    plays = min_max_norm(plays)
    print("Added normalized amount by game")

    # create game ids
    game_coding = pd.DataFrame(plays['game_name'].unique()).reset_index()
    game_coding.columns = ["game_id", "game_name"]

    # replace game names with ids
    plays = plays.merge(game_coding, on="game_name")
    plays = plays.drop(columns="game_name")
    print("Created game ids")

    # make user ids continous and start from 0
    user_coding = pd.DataFrame(plays['user_id'].unique()).reset_index()
    user_coding.columns = ["new_user_id", "user_id"]
    plays = plays.merge(user_coding, on="user_id")
    plays = plays.drop(columns="user_id")
    plays = plays.rename(columns={"new_user_id": "user_id"})
    print("Created new user ids")

    # split into train and test
    train = pd.DataFrame()
    test = pd.DataFrame()
    for _, group in plays.groupby('user_id'):
        curr_train, curr_test = train_test_split(group, test_size=1)
        train = train.append(curr_train)
        test = test.append(curr_test)

    if np.array_equal(train['user_id'].unique(), test['user_id'].unique()):
        print("Train and test properly constructed")
    print("Created train and test")

    # save to csv
    train.to_csv("data\\train-plays.csv", index=False)
    test.to_csv("data\\test-plays.csv", index=False)
    game_coding.to_csv("data\\game-coding.csv", index=False)
    print("Saved data and codings to csvs")


main()
