import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function FeststellungsprotokollForm() {
  const [data, setData] = useState({
    gesellschaft: "",
    hrb: "",
    registergericht: "",
    ort: "",
    datum: "",
    uhrzeit: "",
    geschaeftsjahr: "",
    ergebnisart: "Jahresüberschuss",
    jahresergebnis: "",
    verwendung: "",
    ausschuettungsbetrag: "",
    ausschuettungsdatum: "",
    ruecklagenanteil: "",
    ruecklagenoption: "",
    gesellschafter: "",
    bilanzsumme: "",
    sonstigeBeschluesse: "",
    beschlussfaehig: false,
  });

  const [dokument, setDokument] = useState("");

  const formatDate = (isoDate) => {
    if (!isoDate) return "[Datum fehlt]";
    const d = new Date(isoDate);
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
  };

  const formatCurrency = (value) => {
    if (!value) return "[Betrag fehlt]";
    const num = parseFloat(value.replace(",", ".").replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? "[ungültiger Betrag]" : num.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  };

  const generateVerwendungText = () => {
    const betrag = formatCurrency(data.ausschuettungsbetrag);
    const ausschDatum = formatDate(data.ausschuettungsdatum);
    const ruecklagen = formatCurrency(data.ruecklagenanteil);

    if (data.ergebnisart === "Jahresüberschuss") {
      switch (data.verwendung) {
        case "Thesaurierung":
          return "Der Jahresüberschuss wird in voller Höhe auf neue Rechnung vorgetragen.";
        case "Ausschüttung":
          return `Der Jahresüberschuss wird vollständig an die Gesellschafter ausgeschüttet. Die Ausschüttung erfolgt zum ${ausschDatum}.`;
        case "Teilausschüttung":
          return `Ein Betrag von ${betrag} wird ausgeschüttet. Der verbleibende Überschuss wird vorgetragen. Die Auszahlung soll zum ${ausschDatum} erfolgen.`;
        case "Rücklagenbildung":
          if (data.ruecklagenoption === "vollstaendig") {
            return "Der Jahresüberschuss wird vollständig den Rücklagen zugeführt.";
          } else if (data.ruecklagenoption === "teilweise") {
            return `Ein Betrag von ${ruecklagen} wird den Rücklagen zugeführt, der Rest vorgetragen.`;
          }
          return "[Rücklagenoption fehlt]";
      }
    }

    if (data.ergebnisart === "Jahresfehlbetrag") {
      switch (data.verwendung) {
        case "Vortrag auf neue Rechnung":
          return "Der Fehlbetrag wird vollständig auf neue Rechnung vorgetragen. Die Fortführung des Unternehmens ist trotz Fehlbetrag sichergestellt.";
        case "Verrechnung mit Gewinnrücklagen (und Vortrag auf neue Rechnung)":
          return "Der Fehlbetrag wird mit Rücklagen verrechnet. Ein etwaiger übersteigender Fehlbetrag wird vorgetragen. Die Fortführung des Unternehmens ist trotz Fehlbetrag sichergestellt.";
        default:
          return "[Verwendung unklar]";
      }
    }

    return "[Verwendung fehlt]";
  };

  const validate = () => {
    const pflichtfelder = ["gesellschaft", "hrb", "registergericht", "ort", "datum", "jahresergebnis", "bilanzsumme", "gesellschafter"];
    for (const feld of pflichtfelder) {
      if (!data[feld]) return alert("Bitte alle Pflichtfelder ausfüllen.");
    }
    if (!data.beschlussfaehig) {
      return alert("Bitte bestätigen Sie die Beschlussfähigkeit.");
    }
    return true;
  };

  const generateDocument = () => {
    if (!validate()) return;

    const verwendungstext = generateVerwendungText();

    const protokoll = `
      <div style="font-family: Arial, sans-serif; font-size: 11pt;">
        <strong>Gesellschafterbeschluss zur Feststellung des Jahresabschlusses für das Geschäftsjahr ${data.geschaeftsjahr}</strong><br /><br />
        Die Gesellschafterversammlung der <strong>${data.gesellschaft}</strong>, eingetragen beim Amtsgericht <strong>${data.registergericht}</strong> unter HRB <strong>${data.hrb}</strong>,
        ist am <strong>${formatDate(data.datum)}${data.uhrzeit ? ` um ${data.uhrzeit} Uhr` : ""}</strong> in <strong>${data.ort}</strong> unter Verzicht auf sämtliche Formvorschriften und Fristen zusammengekommen.<br /><br />
        Es wird festgestellt, dass die Gesellschafterversammlung vollständig vertreten und gemäß der gesetzlichen Vorschriften sowie der Regelungen der Satzung beschlussfähig ist.<br /><br />
        Folgende Beschlüsse werden gefasst:<br />
        1. Der Jahresabschluss zum 31.12.${data.geschaeftsjahr} mit einer Bilanzsumme von ${formatCurrency(data.bilanzsumme)} wird festgestellt.<br />
        2. Der ${data.ergebnisart} in Höhe von ${formatCurrency(data.jahresergebnis)} wird wie folgt verwendet:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;${verwendungstext}<br />
        3. Die Geschäftsführung wird angewiesen, die Offenlegung im Unternehmensregister vorzunehmen.<br />
        4. Der Geschäftsführung wird Entlastung erteilt.<br />
        ${data.sonstigeBeschluesse ? `5. Weitere Beschlüsse:<br />${data.sonstigeBeschluesse}<br />` : ""}
        <br />
        Anwesende Gesellschafter:<br />
        ${data.gesellschafter}<br /><br />
        <br /><br />
        <br /><br />
        <br /><br />
        [Unterschrift/en der Gesellschafter]<br /><br />
        <br /><br />
        Hinweis: Bitte dieses Dokument durch alle Gesellschafter unterzeichnen und an office@insight-tax.de weiterleiten. Sobald uns das Protokoll vorliegt, nehmen wir die Offenlegung beim Unternehmensregister vor.
      </div>
    `;

    setDokument(protokoll);
  };

  const handlePrint = () => {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    console.log("drucke dokument", dokument);
    printWindow.document.write(`
      <html>
        <head>
          <title>Protokoll</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11pt; padding: 40px; }
          </style>
        </head>
        <body>${dokument}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
};

  
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-black text-white">
      <h2 className="text-xl font-semibold">Formulierungshilfe: Gesellschafterbeschluss zur Feststellung des Jahresabschlusses</h2>
      <p className="text-sm text-gray-300 mt-1">Hinweis: Alle Felder sind Pflichtfelder.</p>
      <p className="text-sm text-gray-300 mt-1">Disclaimer: Es handelt sich hierbei um ein Angebot zur vereinfachten Beschlussfassung. Wir übernehmen keine Haftung für die Vollständigkeit und Richtigkeit des generierten Protokolls. Im Zweifel ist ein Rechtsanwalt hinzuzuziehen.</p>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input placeholder="Gesellschaft" value={data.gesellschaft} onChange={(e) => setData({ ...data, gesellschaft: e.target.value })} />
          <Input placeholder="HRB-Nummer (ohne 'HRB')" value={data.hrb} onChange={(e) => setData({ ...data, hrb: e.target.value })} />
          <Input placeholder="Registergericht" value={data.registergericht} onChange={(e) => setData({ ...data, registergericht: e.target.value })} />
          <Input placeholder="Geschäftsjahr (z. B. 2024)" value={data.geschaeftsjahr} onChange={(e) => setData({ ...data, geschaeftsjahr: e.target.value })} />
          <Input placeholder="Ort" value={data.ort} onChange={(e) => setData({ ...data, ort: e.target.value })} />
          <Input type="date" value={data.datum} onChange={(e) => setData({ ...data, datum: e.target.value })} />
          <Input placeholder="Uhrzeit (z. B. 10:00)" value={data.uhrzeit} onChange={(e) => setData({ ...data, uhrzeit: e.target.value })} />
          <div className="flex items-center space-x-2">
            <Checkbox checked={data.beschlussfaehig} onCheckedChange={(v) => setData({ ...data, beschlussfaehig: v })} />
            <label className="text-sm">Ich bestätige die ordnungsgemäße Beschlussfähigkeit</label>
          </div>
          <Textarea placeholder="Anwesende Gesellschafter (z.B. Max Mustermann, 100% der Anteile)" value={data.gesellschafter} onChange={(e) => setData({ ...data, gesellschafter: e.target.value })} />
          <Input placeholder="Bilanzsumme in EUR" value={data.bilanzsumme} onChange={(e) => setData({ ...data, bilanzsumme: e.target.value })} />
          <Input placeholder="Jahresergebnis in EUR" value={data.jahresergebnis} onChange={(e) => setData({ ...data, jahresergebnis: e.target.value })} />

          <Select value={data.ergebnisart} onValueChange={(v) => setData({ ...data, ergebnisart: v, verwendung: "", ruecklagenoption: "", ruecklagenanteil: "", ausschuettungsbetrag: "", ausschuettungsdatum: "" })}>
            <SelectTrigger><SelectValue placeholder="Ergebnisart" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Jahresüberschuss">Jahresüberschuss</SelectItem>
              <SelectItem value="Jahresfehlbetrag">Jahresfehlbetrag</SelectItem>
            </SelectContent>
          </Select>

          {data.ergebnisart === "Jahresüberschuss" && (
            <>
              <Select value={data.verwendung} onValueChange={(v) => setData({ ...data, verwendung: v })}>
                <SelectTrigger><SelectValue placeholder="Verwendung" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Thesaurierung">Thesaurierung</SelectItem>
                  <SelectItem value="Ausschüttung">Vollausschüttung</SelectItem>
                  <SelectItem value="Teilausschüttung">Teilausschüttung</SelectItem>
                  <SelectItem value="Rücklagenbildung">Rücklagenbildung</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm mt-2 text-gray-300">
                <strong>Vorschau:</strong> {generateVerwendungText()}
              </div>
            </>
          )}

          {data.ergebnisart === "Jahresfehlbetrag" && (
            <>
              <Select value={data.verwendung} onValueChange={(v) => setData({ ...data, verwendung: v })}>
                <SelectTrigger><SelectValue placeholder="Verwendung" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vortrag auf neue Rechnung">Vortrag auf neue Rechnung</SelectItem>
                  <SelectItem value="Verrechnung mit Gewinnrücklagen (und Vortrag auf neue Rechnung)">Verrechnung mit Gewinnrücklagen</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm mt-2 text-gray-300">
                <strong>Vorschau:</strong> {generateVerwendungText()}
              </div>
            </>
          )}

          {data.verwendung === "Teilausschüttung" && (
            <>
              <Input placeholder="Ausschüttungsbetrag in EUR" value={data.ausschuettungsbetrag} onChange={(e) => setData({ ...data, ausschuettungsbetrag: e.target.value })} />
              <div>
                <label className="text-sm block mb-1">Datum der Auszahlung und Kapitalertragsteueranmeldung</label>
                <Input type="date" value={data.ausschuettungsdatum} onChange={(e) => setData({ ...data, ausschuettungsdatum: e.target.value })} />
              </div>
            </>
          )}

          {data.verwendung === "Ausschüttung" && (
            <div>
              <label className="text-sm block mb-1">Datum der Auszahlung und Kapitalertragsteueranmeldung</label>
              <Input type="date" value={data.ausschuettungsdatum} onChange={(e) => setData({ ...data, ausschuettungsdatum: e.target.value })} />
            </div>
          )}

          {data.verwendung === "Rücklagenbildung" && (
            <Select value={data.ruecklagenoption} onValueChange={(v) => setData({ ...data, ruecklagenoption: v })}>
              <SelectTrigger><SelectValue placeholder="Option Rücklagenbildung" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vollstaendig">Vollständig</SelectItem>
                <SelectItem value="teilweise">Teilweise</SelectItem>
              </SelectContent>
            </Select>
          )}

          {data.ruecklagenoption === "teilweise" && (
            <Input placeholder="Betrag für Rücklagenbildung in EUR" value={data.ruecklagenanteil} onChange={(e) => setData({ ...data, ruecklagenanteil: e.target.value })} />
          )}

          <Textarea placeholder="Sonstige Beschlüsse (optional)" value={data.sonstigeBeschluesse} onChange={(e) => setData({ ...data, sonstigeBeschluesse: e.target.value })} />
          <Button onClick={generateDocument}>Protokoll generieren</Button>
        </CardContent>
      </Card>
{dokument && (
  <Button variant="outline" onClick={handlePrint} className="text-black">
  Als PDF drucken
</Button>
)}

      {dokument && (
        <div className="mt-6 p-4 bg-white text-black rounded shadow">
          <div dangerouslySetInnerHTML={{ __html: dokument }} />
        </div>
      )}
    </div>
  );
}
