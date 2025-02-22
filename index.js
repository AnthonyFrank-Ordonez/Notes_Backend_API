require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const Note = require("./models/note");

app.use(express.json());
app.use(express.static("dist"));
app.use(cors());

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/notes/:id", (request, response) => {
  Note.findByIdAndUpdate(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  const note = new Note({
    content: body.content,
    important: Boolean(body.important) || false,
  });

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

app.put("/api/notes/:id", (request, reponse, next) => {
  const { content, important } = request.body;

  // const note = {
  //   content: content,
  //   important: important,
  // };

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedNote) => {
      reponse.json(updatedNote);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, reponse) => {
  reponse.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError")
    return response.status(400).send({ error: "malformed id" });
  else if (error.name === "ValidationError")
    return response.status(400).json({ error: error.message });

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on the port http://localhost:${PORT}/`);
});

/* 
LEGACY CODE:

let notes = [
  {
    id: "1", 
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

// Legacy GET route for specific note using array:
const id = request.params.id;
const note = notes.find((note) => note.id === id);
if (note) {
  response.json(note);
} else {
  response
    .status(404)
    .send(
      "There are no Note in your specified ID. Please double check you inputted ID"
    )
    .end();
}

// Legacy DELETE route using array:
const id = request.params.id;
notes = notes.filter((note) => note.id !== id);
response.status(204).end();

// Legacy ID generator:
const generateId = () => {
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0;
  return String(maxId + 1);
};
*/
