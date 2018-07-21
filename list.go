package main

import (
    "net/http"
    "io/ioutil"
    "fmt"
    "encoding/json"
    "log"
)

func fListCompany(w http.ResponseWriter, r *http.Request)  {
    slFile, err := ioutil.ReadDir("./csv")

    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
    w.Header().Set("Content-Type", "application/json")

    if err != nil {
        fmt.Fprintf(w, `{"error": "%s"}`, err)
        log.Println(err)
        return
    }

    var slFileName []string

    for _, oFile := range slFile {
        slFileName = append(slFileName, oFile.Name()[:len(oFile.Name()) - 4])
    }

    var jsonb []byte
    jsonb, err = json.Marshal(slFileName)
    if err != nil {
        fmt.Fprintf(w, `{"error": "%s"}`, err)
        log.Println(err)
        return
    }

    fmt.Fprint(w, string(jsonb))
}
