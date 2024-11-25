import "dotenv/config";

import express from "express";
import cors from "cors";
import morgan from "morgan";

import Person from "./person.js";

const PORT = 3001;
const app = express();

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

morgan.token("body", (req) => {
  if (req.method === "POST") return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  let errors = [];
  if (!body.name) {
    errors.push("name is missing");
  }
  if (!body.number) {
    errors.push("number is missing");
  }
  if (persons.find((person) => person.name === body.name)) {
    errors.push("name must be unique");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      errors,
    });
  }

  const personObject = {
    name: body.name,
    number: body.number,
  };

  Person.create(personObject)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => {
      res.status(500).json({ error: "unknown error" });
    });
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => {
      res.status(500).end({ error: "unknown error" });
    });
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.get("/info", (req, res) => {
  Person.countDocuments({})
    .then((count) => {
      const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Info</title>
</head>
<body>
<p>Phonebook has info for ${count} people</p>
<p>${new Date()}</p>
</body>
</html>`;
      res.send(html);
    })
    .catch((error) => {
      res.status(500).end();
    });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
