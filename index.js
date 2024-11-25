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

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  let errors = [];
  if (!body.name) {
    errors.push("name is missing");
  }
  if (!body.number) {
    errors.push("number is missing");
  }

  Person.find({ name: body.name }).then((persons) => {
    if (persons.length > 0) {
      errors.push("name must be unique");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        errors,
      });
    }

    const person = {
      name: body.name,
      number: body.number,
    };

    Person.create(person)
      .then((savedPerson) => {
        res.json(savedPerson);
      })
      .catch((error) => next(error));
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    id,
    { name, number },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  )
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res, next) => {
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
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
