import express from "express";

const PORT = 3001;

const app = express();

app.use(express.json());

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
  res.json(persons);
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

  const person = {
    id: String(Math.random()).substring(2),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  res.json(person);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.get("/info", (req, res) => {
  const date = new Date();
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Info</title>
</head>
<body>
<p>Phonebook has info for ${persons.length} people</p>
<p>${date}</p>
</body>
</html>`;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
