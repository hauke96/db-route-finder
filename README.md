# Bahn Reiseauskunft als API benutzen

Oder: HTML ist halt auch nur XML.

* Die URL `https://reiseauskunft.bahn.de/bin/query.exe/dn?ld=4379&protocol=https:&seqnr=4&ident=lg.03262179.1638445890&rt=1&rememberSortType=minDeparture&REQ0HafasScrollDir=2` bietet zunächst (s.u.) keine sonstigen Parameter für z.B. Abfahrts- und Zielbahnhof
* Parameter werden als Coockies übergeben: `s_ppv`, `s_ppvl` und `s_sq`
  * Doppeltes URL-Decoding nötig:
    * Original: `dbbahnprod=%26c.%26a.%26activitymap.%26page%3DBAHN_ASK_DEU_de_BAHN_AuskunftVerbindungenHinfahrt%26link%3DFr%25C3%25BCher%26region%3DresultsOverviewLinksAbove%26pageIDType%3D1%26.activitymap%26.a%26.c%26pid%3DBAHN_ASK_DEU_de_BAHN_AuskunftVerbindungenHinfahrt%26pidt%3D1%26oid%3Dhttps%253A%252F%252Freiseauskunft.bahn.de%252Fbin%252Fquery.exe%252Fdn%253Fld%253D43185%2526protocol%253Dhttps%253A%2526seqnr%253D1%2526ident%253D6q.010313185.1%26ot%3DA`
    * 1 x decode: `dbbahnprod=&c.&a.&activitymap.&page=BAHN_ASK_DEU_de_BAHN_AuskunftVerbindungenHinfahrt&link=Fr%C3%BCher&region=resultsOverviewLinksAbove&pageIDType=1&.activitymap&.a&.c&pid=BAHN_ASK_DEU_de_BAHN_AuskunftVerbindungenHinfahrt&pidt=1&oid=https%3A%2F%2Freiseauskunft.bahn.de%2Fbin%2Fquery.exe%2Fdn%3Fld%3D43185%26protocol%3Dhttps%3A%26seqnr%3D1%26ident%3D6q.010313185.1&ot=A`
    * 2 x decode: `dbbahnprod=&c.&a.&activitymap.&page=BAHN_ASK_DEU_de_BAHN_AuskunftVerbindungenHinfahrt&link=Früher&region=resultsOverviewLinksAbove&pageIDType=1&.activitymap&.a&.c&pid=BAHN_ASK_DEU_de_BAHN_AuskunftVerbindungenHinfahrt&pidt=1&oid=https://reiseauskunft.bahn.de/bin/query.exe/dn?ld=43185&protocol=https:&seqnr=1&ident=6q.010313185.1&ot=A`
  * Nichts davon ist hilfreich. NICE!

## Ändern der Angaben (`POST` statt `GET`)

* Bahn macht beim ändern von Angaben statt `GET` ein `POST`
  * Sendet Daten als URL encoded key-value-Paare im body mit
    ```
    HWAI=QUERY!rit=no
    queryPageDisplayed=yes
    HWAI=QUERY!displayed=yes
    HWAI=JS!ajax=yes
    HWAI=JS!js=yes
    REQ0JourneyStopsS0A=255
    REQ0JourneyStopsS0G=Hamburg+Hbf
    REQ0JourneyStopsS0ID=A=1@O=Hamburg+Hbf@X=10006909@Y=53552733@U=80@L=008002549@B=1@p=1638222909@
    REQ0JourneyStopsS0o=8
    REQ0JourneyStopsS0a=131072
    REQ0JourneyStopsZ0A=255
    REQ0JourneyStopsZ0G=Berlin+Hbf
    REQ0JourneyStopsZ0ID=
    REQ0JourneyStopsZ0o=8
    REQ0JourneyStopsZ0a=131072
    REQ0JourneyDate=Do,+02.12.21
    REQ0JourneyTime=13:20
    REQ0HafasSearchForw=1
    REQ1JourneyDate=
    REQ1JourneyTime=
    REQ1HafasSearchForw=1
    REQ0JourneyRevia=yes
    HWAI=QUERY$via$0!number=0
    REQ0JourneyStops1ID=
    REQ0JourneyStops2ID=
    HWAI=QUERY$via$1!number=0
    REQ1JourneyStops1ID=
    REQ1JourneyStops2ID=
    HWAI=QUERY!prodAdvanced=0
    existOptimizePrice=1
    REQ0HafasOptimize1=0:1
    existProductNahverkehr=1
    HWAI=QUERY$PRODUCTS$0_0!show=yes
    HWAI=QUERY$PRODUCTS$0_0!show=yes
    advancedProductMode=yes
    REQ0JourneyProduct_prod_section_0_0=1
    REQ0JourneyProduct_prod_section_0_1=1
    REQ0JourneyProduct_prod_section_0_2=1
    REQ0JourneyProduct_prod_section_0_3=1
    REQ0JourneyProduct_prod_section_0_4=1
    REQ0JourneyProduct_prod_section_0_5=1
    REQ0JourneyProduct_prod_section_0_6=1
    REQ0JourneyProduct_prod_section_0_7=1
    REQ0JourneyProduct_prod_section_0_8=1
    REQ0JourneyProduct_prod_section_0_9=1
    REQ0JourneyProduct_opt_section_0_list=0:0000
    REQ0HafasChangeTime=15:3
    existIntermodalDep_enable=yes
    REQ0JourneyDep__enable=Foot
    existIntermodalDest_enable=yes
    REQ0JourneyDest__enable=Foot
    HWAI=QUERY!hideExtInt=no
    REQ0JourneyDep_Foot_minDist=0
    REQ0JourneyDest_Foot_minDist=0
    REQ0JourneyDep_Foot_maxDist=2000
    REQ0JourneyDest_Foot_maxDist=2000
    REQ0JourneyDep_Bike_minDist=0
    REQ0JourneyDest_Bike_minDist=0
    REQ0JourneyDep_Bike_maxDist=5000
    REQ0JourneyDest_Bike_maxDist=5000
    REQ0JourneyDep_KissRide_minDist=2000
    REQ0JourneyDest_KissRide_minDist=2000
    REQ0JourneyDep_KissRide_maxDist=50000
    REQ0JourneyDest_KissRide_maxDist=50000
    travelProfile=
    traveller_Nr=1
    REQ0Tariff_TravellerType.1=E
    REQ0Tariff_TravellerReductionClass.1=2
    REQ0Tariff_TravellerAge.1=
    REQ0Tariff_Class=2
    existOptionBits=yes
    existTbpMode=1
    rtMode=12
    start=Suchen
    ```
  * Manche Punkte enthalten mehrere `=` Zeichen
  * Nötig für simple Anfragen sind nur (hier mit `:` statt `=`)
    ```
    REQ0JourneyStopsS0A:255
    REQ0JourneyStopsS0G:Hamburg+Hbf
    REQ0JourneyStopsZ0A:255
    REQ0JourneyStopsZ0G:Berlin+Hbf
    REQ0JourneyDate:Do,+02.12.21
    REQ0JourneyTime:13:20
    traveller_Nr:1
    REQ0Tariff_TravellerReductionClass.1:2
    start:Suchen
    ```

## Geht auch alles per `GET`

https://reiseauskunft.bahn.de/bin/query.exe/dn?REQ0JourneyStopsS0A=255&REQ0JourneyStopsS0G=Hamburg+Hbf&REQ0JourneyStopsZ0A=255&REQ0JourneyStopsZ0G=Berlin+Hbf&REQ0JourneyDate=Do,+02.12.21&REQ0JourneyTime=13:20&start=Suchen&REQ0Tariff_TravellerReductionClass.1=2

* Klickt man auf "Früher" oder "Später" macht man wieder ein `GET`
* Aus vorheriger Anfrage wird doppelt encodieter Coockie `DB4-pb-bibe-history` mit gesendet:
```
history=Stop1%3DI%253Dstop1%25A7L%253DA%253D1%2540O%253DBerlin%2BHbf%2540X%253D13369549%2540Y%253D52525589%2540U%253D80%2540L%253D008011160%2540B%253D1%2540p%253D1638222909%2540%25A7%26Stop2%3DI%253Dstop2%25A7L%253DA%253D1%2540O%253DHamburg%2BHbf%2540X%253D10006909%2540Y%253D53552733%2540U%253D80%2540L%253D008002549%2540B%253D1%2540p%253D1638222909%2540%25A7%26Stop3%3DI%253Dstop3%25A7L%253DA%253D1%2540O%253DHAMBURG%2540X%253D9997434%2540Y%253D53557110%2540U%253D81%2540L%253D008096009%2540B%253D1%2540p%253D1638216919%2540%25A7%26&
```
(mit sinnlosem und nicht kodiertem `&` am Ende lol)
* 1 x decode
```
history=Stop1=I%3Dstop1%A7L%3DA%3D1%40O%3DBerlin+Hbf%40X%3D13369549%40Y%3D52525589%40U%3D80%40L%3D008011160%40B%3D1%40p%3D1638222909%40%A7&Stop2=I%3Dstop2%A7L%3DA%3D1%40O%3DHamburg+Hbf%40X%3D10006909%40Y%3D53552733%40U%3D80%40L%3D008002549%40B%3D1%40p%3D1638222909%40%A7&Stop3=I%3Dstop3%A7L%3DA%3D1%40O%3DHAMBURG%40X%3D9997434%40Y%3D53557110%40U%3D81%40L%3D008096009%40B%3D1%40p%3D1638216919%40%A7&&
```
* 2 x decode
```
(invalid url encoding)
```
... what?
* Turns out: Bahn nutzt Windows-Server mit Windows-1252 encoding, wo `§` als `%A7` kodiert wird, normalerweise geht man aber von UTF-8 aus, wo das als `%C2%A7` kodiert wird. Also alle `%A7` durch `%C2%A7` ersetzen klappt:
```
history=Stop1=I=stop1§L=A=1@O=Berlin+Hbf@X=13369549@Y=52525589@U=80@L=008011160@B=1@p=1638222909@§&Stop2=I=stop2§L=A=1@O=Hamburg+Hbf@X=10006909@Y=53552733@U=80@L=008002549@B=1@p=1638222909@§&Stop3=I=stop3§L=A=1@O=HAMBURG@X=9997434@Y=53557110@U=81@L=008096009@B=1@p=1638216919@§&&
```
* Moment ... Wenn `&` das Trennzeichen ist, hat man nur drei Zeilen, das sind aber mehr als drei key-value-paare. Turns out:
* Nach erstem decoding ist `&` das Trennzeichen
* Die einzelnen Parameter sind aber nochmal kodiert (daher zweites decoding) und mit `§` getrennt. WAS ZUM?!
* Die final erhaltenen Werte sind nochmals key-value-paare, die mit `@` getrennt und zum Glück nicht nochmal kodiert sind
* Ersetzt man `&`, `§` und `@` durch Zeilenumbrüche erhält man
  ```
  history=Stop1=I=stop1
  L=A=1
  O=Berlin+Hbf
  X=13369549
  Y=52525589
  U=80
  L=008011160
  B=1
  p=1638222909

  Stop2=I=stop2
  L=A=1
  O=Hamburg+Hbf
  X=10006909
  Y=53552733
  U=80
  L=008002549
  B=1
  p=1638222909

  Stop3=I=stop3
  L=A=1
  O=HAMBURG
  X=9997434
  Y=53557110
  U=81
  L=008096009
  B=1
  p=1638216919
  ```
* Okay. Hier sieht man also Bahnhöfe und IDs der Bahnhöfe. Hamburg HBF hat z.B. die IBNR (Interne Bahnhofsnummer) 8002549, passt also. So richtig nützlich ist das jetzt aber nicht. Machen wir also hier nicht weiter.

So viel dazu.
Jetzt wissen wir also was passiert, wenn man "Früher" oder "Später" drückt.
Wie kann man das direkt als Anfrage abschicken, sodass man von vornherein mehr Daten erhält?

## Mehr Ergebnisse per GET/POST

Antwort: Uff.

### Einfach `REQ0HafasScrollDir` setzen

Einfach an die URL ein `...&REQ0HafasScrollDir=2` setzen und man erhält:
```
Sehr geehrte Kundin, sehr geehrter Kunde,


Ihre Verbindungsanfrage konnte leider nicht verarbeitet werden .....
```

WAS ZUM?!
Das Setzen eines weiteren Parameters, der an anderen Stellen exakt auf diese Weise benutzt wird, sorgt für interne Server-Fehler? Alter Falter.

Also das hier geht nicht:<br>
https://reiseauskunft.bahn.de/bin/query.exe/dn?REQ0JourneyStopsS0A=255&REQ0JourneyStopsS0G=Hamburg+Hbf&REQ0JourneyStopsZ0A=255&REQ0JourneyStopsZ0G=Berlin+Hbf&REQ0JourneyDate=Do,+02.12.21&REQ0JourneyTime=13:20&start=Suchen&REQ0Tariff_TravellerReductionClass.1=2&REQ0HafasScrollDir=1

### `REQ0HafasScrollDir` und `ident`setzen

Wenn man `ident` (ID vorheriger Anfragen) statt einzelner Parameter setzt gehts:<br>
https://reiseauskunft.bahn.de/bin/query.exe/dn?ld=43185&protocol=https:&seqnr=6&ident=3i.024040185.1638457705&rt=1&rememberSortType=minDeparture&REQ0HafasScrollDir=1

Allerdings ist `ident` eine Art Session-ID, da es nach einer gewissen Zeit nicht mehr funktioniert. Schade.

### Die Wege des `ident` sind unergründlich

Im Request wird `ident` an einigen Stellen gesetzt:

* In der URL als Parameter `ident=...`
* Im Coockie `s_sq` steckt die komplette URL nochmal drin samt `ident` Parameter. Warum auch immer ...
* Als eigener Coockie `ident=...; Path=/; Secure; SameSite=None; Version=1`

In der Response kommt er auch vor:

* Als Coockie `ident=...; Path=/; Secure; SameSite=None; Version=1`

### `ident` selbst erzeugen und setzen

Bei der response unserer `POST` und `GET` Anfragen oben kriegen wir einen `ident` Coockie mitgeliefert. Wunderbar! Funktioniert der zum Abfragen mehrerer Ergebnisse mittels `REQ0HafasScrollDir`? Nö. Warum? Keine Ahnung.

TODO `s_sq` Coockie anschauen, vielleicht ist der Nötig

# Fuck it, `mgate` regelt

Mobile App nutzt *natürlich* einen anderen Endpunkt, nämlich https://reiseauskunft.bahn.de/bin/mgate.exe.

Ein Request sieht so aus:
```
POST https://reiseauskunft.bahn.de/bin/mgate.exe?checksum=f4b9850d12534f9bd782ee9f6ddbf91b

{
    "lang": "en",
    "svcReqL": [
        {
            "cfg": {
                "polyEnc": "GPA",
                "rtMode": "HYBRID"
            },
            "meth": "TripSearch",
            "req": {
                "getPasslist": false,
                "maxChg": -1,
                "minChgTime": 0,
                "depLocL": [
                    {
                        "type": "S",
                        "lid": "A=1@L=8011167@"
                    }
                ],
                "viaLocL": [],
                "arrLocL": [
                    {
                        "type": "S",
                        "lid": "A=1@L=8000261@"
                    }
                ],
                "jnyFltrL": [
                    {
                        "type": "PROD",
                        "mode": "INC",
                        "value": "1023"
                    },
                    {
                        "type": "META",
                        "mode": "INC",
                        "meta": "notBarrierfree"
                    }
                ],
                "gisFltrL": [],
                "getTariff": false,
                "ushrp": true,
                "getPT": true,
                "getIV": false,
                "getPolyline": false,
                "outDate": "20211204",
                "outTime": "133137",
                "numF": 1,
                "outFrwd": true,
                "trfReq": {
                    "jnyCl": 2,
                    "tvlrProf": [
                        {
                            "type": "E",
                            "redtnCard": null
                        }
                    ],
                    "cType": "PK"
                }
            }
        }
    ],
    "client": {
        "type": "AND",
        "id": "DB",
        "v": 19040000,
        "name": "DB Navigator"
    },
    "ext": "DB.R20.12.b",
    "ver": "1.34",
    "auth": {
        "type": "AID",
        "aid": "n91dB8Z77MLdoR0K"
    }
}
```

Klappt, aber fuck it, nimm einfach ne lbrary wie die Node-Library `db-hafas`.

# Mit ner library wird alles besser

