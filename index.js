const lineReader = require("line-reader"),
  ics = require("ics"),
  Promise = require("bluebird"),
  moment = require("moment"),
  fs = require("fs");

require("moment/locale/es");

let dia = 1;

var eachLine = Promise.promisify(lineReader.eachLine);

let eventos = [];
let evento = {};
let diaIngles;
eachLine("texto.txt", function (line) {
  if (line.includes("Lunes")) {
    dia = 1;
    diaIngles = "MO";
  }
  if (line.includes("Martes")) {
    dia = 2;
    diaIngles = "TU";
  }
  if (line.includes("Miércoles")) {
    dia = 3;
    diaIngles = "WE";
  }
  if (line.includes("Jueves")) {
    dia = 4;
    diaIngles = "TH";
  }
  if (line.includes("Viernes")) {
    dia = 5;
    diaIngles = "FR";
  }
  if (line.includes("Sabado")) {
    dia = 6;
    diaIngles = "SA";
  }

  if (line.startsWith("(")) {
    let datos = line.split("	");
    const nombre = datos[1].split("(")[0];
    const horaInicio = datos[0].split("-")[0].replace("(", "").split(":");
    const horaFin = datos[0].split("-")[1].replace(")", "").split(":");

    moment.locale("es");
    let inicio = moment().day(dia);
    let fin = moment().day(dia);

    inicio = inicio
      .hour(horaInicio[0])
      .minutes(horaInicio[1])
      .seconds(0)
      .milliseconds(0);
    fin = fin
      .day(dia)
      .hour(horaFin[0])
      .minutes(horaFin[1])
      .seconds(0)
      .milliseconds(0);

    evento["inicio"] = inicio;
    evento["fin"] = fin;
    evento["title"] = nombre;
  }
  if (line.startsWith("sala")) {
    let datos = line.split("	");
    let ubicacion = datos[0]
      .split("-")[0]
      .replace("sala ", "")
      .split("(")[0]
      .replace("SAN JOAQUÍN", "");
    inicioD = evento.inicio.toArray().splice(0, 5);
    finD = evento.fin.toArray().splice(0, 5);
    inicioD[1] += 1;
    finD[1] += 1;
    eventos.push({
      title: evento.title,
      start: inicioD,
      end: finD,
      location: ubicacion,
      recurrenceRule: `FREQ=WEEKLY;BYDAY=${diaIngles};INTERVAL=1;UNTIL=${evento.inicio
        .add(4, "M")
        .format("YYYYMMDD")}T0400Z`,
    });
  }
})
  .then(function () {
    ics.createEvents(eventos, (error, value) => {
      if (error) {
        console.log(error);
      } else {
        fs.writeFileSync(`${__dirname}/event.ics`, value);
      }
    });

    console.log("done");
  })
  .catch(function (err) {
    console.error(err);
  });
