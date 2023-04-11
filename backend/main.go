package main

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gookit/ini/v2"
)

func hello(w http.ResponseWriter, req *http.Request) {

	fmt.Fprintf(w, "hello\n")
}

func getAccessToken(w http.ResponseWriter, req *http.Request) {
	code := req.URL.Query().Get("code")

	ghReqUrl := fmt.Sprintf("https://github.com/login/oauth/access_token?"+
		`client_id=%s&`+
		`client_secret=%s&`+
		`code=%s&`+
		`redirect_uri=%s`,
		ini.Get("gh_client_id"),
		ini.Get("gh_client_secret"),
		code,
		ini.Get("gh_redirect_uri"),
	)
	client := &http.Client{}

	ghReq, _ := http.NewRequest("POST", ghReqUrl, nil)
	ghReq.Header.Add("Accept", "application/json")
	resp, err := client.Do(ghReq)

	if err != nil {
		fmt.Println("Errored when sending request to the server")
		return
	}

	defer resp.Body.Close()
	body, rerr := ioutil.ReadAll(resp.Body)
	if rerr != nil {
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func loadConfig() {
	err := ini.LoadExists("config.ini")
	if err != nil {
		panic(err)
	}
}

func corsWrapper(fn func(w http.ResponseWriter, req *http.Request)) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		fn(w, req)
	}
}

func main() {
	loadConfig()

	http.HandleFunc("/echo", corsWrapper(hello))
	http.HandleFunc("/auth", corsWrapper(getAccessToken))

	http.ListenAndServe(":8090", nil)
}
