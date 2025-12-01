# La ruota delle emozioni

Tempo fa girava tra vari blog e siti d’improvvisazione, [questa immagine](https://9gag.com/gag/a67wq2q): una “ruota delle emozioni” realizzata da Kaitlin Robbs, un insegnante (non di improvvisazione), che dettagliava le molte sfaccettature di sentimenti che deriverebbero da 6 emozioni primarie. Ho sempre trovato l’immagine scomoda da consultare, così, quando mi sono messo a giocare e programmare con la libreria grafica D3 ho trovato una modalità per rendere questa utilissima risorsa più fruibile ed un po’ più colorata.

Il grafico è navigabile, quindi cliccando su uno spicchio si visualizzano i suoi spicchi superiori. Per tornare indietro, basta cliccare nel centro del cerchio. Funziona anche da cellulare.

[Clicca qui la ruota delle emozioni](wheel.html)

----

La ruota è stata ospitata a lungo sul sito dell'**Accademia Bresciana di Improvvisazione Teatrale** come risorsa per improvvisatori. Dopo un redisign del sito però, la ruota è stata tolta, ed ora si può continuare ad usare qui su questa pagina. 

Se ti piace la ruota e vuoi supportarmi, allora vai a vedere uno spettacolo dei ragazzi e delle ragazze di [ABIT](https://www.improaccademia.it)!

Se non sei di Brescia, allora vai a vedere un qualsiasi spettacolo di improvvisazione teatrale nella tua città.

----

Il codice JS legge le emozioni dal file `emotions.csv`. Se vuoi provare la ruota in locale e non vedi nulla, può essere che il tuo browser blocchi le richieste per file sul tuo computer (come ad esempio Chrome). Ti basta andare nel file `ruotaemozioni_v2.2.js` e sostituire la riga

`var filename = "emotions.csv";`

con

`var filename = "https://raw.githubusercontent.com/noso2k1/ruota-emozioni/main/emotions.csv"`

---

La traduzione in italiano è stata più difficile di quanto pensassi. Se trovate delle inesattezze o avete suggerimenti, fatemelo pure sapere aprendo una "issue" su GitHub o andando a correggere direttamente il file "emotions.csv".



Il grafico è stato realizzato tramite la libreria javascript D3js, combinando i seguenti esempi:

http://bl.ocks.org/vgrocha/1580af34e56ee6224d33

http://bl.ocks.org/kerryrodden/7090426

http://bl.ocks.org/kerryrodden/477c1bfb081b783f80ad
