package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
)

type Client struct {
	baseURL *url.URL
	client  *http.Client
}

func CreateClient(baseURL *url.URL, client *http.Client) *Client {
	return &Client{
		baseURL: baseURL,
		client:  client,
	}
}

func (c *Client) newRequest(method string, url *url.URL, body interface{}) (*http.Request, error) {
	u := c.baseURL.ResolveReference(url)
	var buf io.ReadWriter
	if body != nil {
		buf = new(bytes.Buffer)
		err := json.NewEncoder(buf).Encode(body)
		if err != nil {
			return nil, err
		}
	}
	req, err := http.NewRequest(method, u.String(), buf)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	return req, nil
}

func (c *Client) do(req *http.Request, v interface{}) (*http.Response, error) {
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	fmt.Printf("\033[1;34mStatus %v\033[0m\n", resp.Status)
	if resp.StatusCode < 300 {
		_ = json.NewDecoder(resp.Body).Decode(v)
	} else {
		body, _ := ioutil.ReadAll(resp.Body)
		bodyString := string(body)
		fmt.Printf("\033[1;31m%s\033[0m\n", bodyString)
	}

	return resp, err
}
