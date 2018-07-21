package main

import (
    "net/http"
    "os"
    "fmt"
    "encoding/csv"
    "io"
    "log"
    "strings"
    "strconv"
)

func fViewCompany(w http.ResponseWriter, r *http.Request)  {

    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
    w.Header().Set("Content-Type", "application/json")

    strCompanyName := r.URL.Query().Get("title")

    if strCompanyName == "" {
        fmt.Fprintf(w, `{"error": "%s"}`, "'title' is a required parameter")
        return
    }



    fCompany1, err := os.Open("./csv/" + strCompanyName + ".csv")
    if err != nil {
        fmt.Fprintf(w, `{"error": "%s"}`, err)
        log.Println(err)
        return
    }


    strLimit := r.URL.Query().Get("limit")

    var boolShouldLimit bool
    intMax := 1
    if strLimit != "" {
        intMax, err = strconv.Atoi(strLimit)
        boolShouldLimit = true
        if err != nil {
            fmt.Fprintf(w, `{"error": "%s"}`, err)
            log.Println(err)
            return
        }
    }



    prcsvCompany := csv.NewReader(fCompany1)


    var slstrHeader, slstrJson []string

    slstrHeader, err = prcsvCompany.Read()
    if err != nil {
        log.Println(err)
    }

    i := 0

    for i < intMax {
        slstrLine, err := prcsvCompany.Read()
        if err == io.EOF {
            break
        }

        if err != nil{
            fmt.Fprintf(w, `{"error": "%s"}`, err)
            log.Println(err)
            return
        }

        slstrJson = append(slstrJson, getJson(slstrHeader, slstrLine))

        if boolShouldLimit {
            i ++
        }
    }

    strResponse := "[" + strings.Join(slstrJson, ",") + "]"

        fmt.Fprintln(w, strResponse)




}
