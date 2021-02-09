process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

const testBook1 = {
  "isbn": "1111111111",
  "amazon_url": "http://test1.com",
  "author": "Test Author1",
  "language": "english",
  "pages": 100,
  "publisher": "Test Publisher1",
  "title": "Test Book1",
  "year": 2020
}

const testBook2 = {
  "isbn": "2222222222",
  "amazon_url": "http://test2.com",
  "author": "Test Author2",
  "language": "french",
  "pages": 200,
  "publisher": "Test Publisher2",
  "title": "Test Book2",
  "year": 2021
}

describe("book routes tests (with cleanup)", () => {
  describe("GET /books tests (with setup)", () => {
    beforeEach(async () => {
      // clear db tables
      await db.query("DELETE FROM books");
    });
    
    test("can get all books", async () => {
      // add sample data
      await db.query(
        "INSERT INTO books VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          testBook1.isbn,
          testBook1.amazon_url,
          testBook1.author,
          testBook1.language,
          testBook1.pages,
          testBook1.publisher,
          testBook1.title,
          testBook1.year
        ]
      );
      await db.query(
        "INSERT INTO books VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          testBook2.isbn,
          testBook2.amazon_url,
          testBook2.author,
          testBook2.language,
          testBook2.pages,
          testBook2.publisher,
          testBook2.title,
          testBook2.year
        ]
      );

      const response = await request(app).get("/books");
      expect(response.statusCode).toEqual(200);
      expect(response.body.books).toContainEqual(testBook1);
      expect(response.body.books).toContainEqual(testBook2);
    });

    test("get [] if no books", async () => {
      const response = await request(app).get("/books");
      expect(response.statusCode).toEqual(200);
      expect(response.body.books).toEqual([]);
    });
  });

  describe("GET /books/:isbn tests (with setup)", () => {
    beforeEach(async () => {
      // clear db tables
      await db.query("DELETE FROM books");

      // add sample data
      await db.query(
        "INSERT INTO books VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          testBook1.isbn,
          testBook1.amazon_url,
          testBook1.author,
          testBook1.language,
          testBook1.pages,
          testBook1.publisher,
          testBook1.title,
          testBook1.year
        ]
      );
    });
    
    test("can get details of 1 book", async () => {
      const response = await request(app).get(`/books/${testBook1.isbn}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body.book).toEqual(testBook1);
    });

    test("get error if try to access book that doesn't exist", async () => {
      const response = await request(app).get("/books/0");
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("POST /books tests (with setup)", () => {
    beforeEach(async () => {
      // clear db tables
      await db.query("DELETE FROM books");

      // add sample data
      await db.query(
        "INSERT INTO books VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          testBook1.isbn,
          testBook1.amazon_url,
          testBook1.author,
          testBook1.language,
          testBook1.pages,
          testBook1.publisher,
          testBook1.title,
          testBook1.year
        ]
      );
    });
    
    test("can create a book", async () => {
      const response = await request(app).post("/books").send(testBook2);
      expect(response.statusCode).toEqual(201);
      expect(response.body.book).toEqual(testBook2);
    });

    test("can't create a book with no data", async () => {
      const response = await request(app).post("/books");
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book with no isbn", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when isbn isn't a string", async () => {
      const data = { ...testBook2 };
      data.isbn = 1;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book with no amazon_url", async () => {
      const data = { ...testBook2 };
      delete data.amazon_url;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when amazon_url isn't a string", async () => {
      const data = { ...testBook2 };
      data.amazon_url = 12;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when amazon_url isn't a url", async () => {
      const data = { ...testBook2 };
      data.amazon_url = "test2.com";
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book with no author", async () => {
      const data = { ...testBook2 };
      delete data.author;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when author isn't a string", async () => {
      const data = { ...testBook2 };
      data.author = 21;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book with no language", async () => {
      const data = { ...testBook2 };
      delete data.language;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when language isn't a string", async () => {
      const data = { ...testBook2 };
      data.language = 66;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book with no pages", async () => {
      const data = { ...testBook2 };
      delete data.pages;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when pages isn't a number", async () => {
      const data = { ...testBook2 };
      data.pages = "261";
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when pages isn't an int", async () => {
      const data = { ...testBook2 };
      data.pages = 261.5;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book with no publisher", async () => {
      const data = { ...testBook2 };
      delete data.publisher;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when publisher isn't a string", async () => {
      const data = { ...testBook2 };
      data.publisher = 95;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book with no title", async () => {
      const data = { ...testBook2 };
      delete data.title;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when title isn't a string", async () => {
      const data = { ...testBook2 };
      data.title = 71;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book with no year", async () => {
      const data = { ...testBook2 };
      delete data.year;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when year isn't a number", async () => {
      const data = { ...testBook2 };
      data.year = "2020";
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't create a book when year isn't an int", async () => {
      const data = { ...testBook2 };
      data.year = 2020.5;
      const response = await request(app).post("/books").send(data);
      expect(response.statusCode).toEqual(400);
    });
  });

  describe("PUT /books/:isbn tests (with setup)", () => {
    beforeEach(async () => {
      // clear db tables
      await db.query("DELETE FROM books");

      // add sample data
      await db.query(
        "INSERT INTO books VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          testBook1.isbn,
          testBook1.amazon_url,
          testBook1.author,
          testBook1.language,
          testBook1.pages,
          testBook1.publisher,
          testBook1.title,
          testBook1.year
        ]
      );
    });
    
    test("can update a book", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      const expectedData = data;
      expectedData.isbn = testBook1.isbn;
      expect(response.statusCode).toEqual(200);
      expect(response.body.book).toEqual(expectedData);
    });

    test("can't update a book that doesn't exist", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      const response = await request(app).put("/books/0").send(data);
      expect(response.statusCode).toEqual(404);
    });

    test("can't update a book without any data", async () => {
      const response = await request(app).put(`/books/${testBook1.isbn}`);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book without amazon_url", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      delete data.amazon_url;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when amazon_url isn't a string", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.amazon_url = 20;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when amazon_url isn't a url", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.amazon_url = "test2.com";
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book without author", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      delete data.author;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when author isn't a string", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.author = 42;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book without language", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      delete data.language;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when language isn't a string", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.language = 28;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book without pages", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      delete data.pages;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when pages isn't a number", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.pages = "two hundred";
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when pages isn't an int", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.pages = 73.5;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book without publisher", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      delete data.publisher;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when publisher isn't a string", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.publisher = 99;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book without title", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      delete data.title;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when title isn't a string", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.title = 103;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book without year", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      delete data.year;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when year isn't a number", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.year = "2016";
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });

    test("can't update a book when year isn't an int", async () => {
      const data = { ...testBook2 };
      delete data.isbn;
      data.year = 2016.3;
      const response = await request(app).put(`/books/${testBook1.isbn}`)
        .send(data);
      expect(response.statusCode).toEqual(400);
    });
  });

  describe("DELETE /books/:isbn tests (with setup)", () => {
    beforeEach(async () => {
      // clear db tables
      await db.query("DELETE FROM books");

      // add sample data
      await db.query(
        "INSERT INTO books VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          testBook1.isbn,
          testBook1.amazon_url,
          testBook1.author,
          testBook1.language,
          testBook1.pages,
          testBook1.publisher,
          testBook1.title,
          testBook1.year
        ]
      );
    });
    
    test("can delete a book", async () => {
      const response = await request(app).delete(`/books/${testBook1.isbn}`);
      expect(response.statusCode).toEqual(200);

      // verify book has been deleted
      const result = await 
        db.query("SELECT isbn FROM books WHERE isbn=$1", [testBook1.isbn]);
      expect(result.rows.length).toEqual(0);  
    });

    test("can't update a book that doesn't exist", async () => {
      const response = await request(app).delete("/books/0");
      expect(response.statusCode).toEqual(404);
    });
  });

  afterAll(async () => {
    db.end();
  });
});