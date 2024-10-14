# Northcoders News API

## Getting Started

To run this project locally, you will need to set up the necessary environment variables. Follow these steps:

1. **Clone the repository:**
  ```sh
  git clone https://github.com/northcoders/be-nc-news.git
  cd be-nc-news
  ```

2. **Install dependencies:**
  ```sh
  npm install
  ```

3. **Set up environment variables:**
  Create two files in the root directory of the project: `.env.development` and `.env.test`.

  - **.env.development:**
    ```
    PGDATABASE=nc_news
    ```

  - **.env.test:**
    ```
    PGDATABASE=nc_news_test
    ```

4. **Set up the databases:**
  ```sh
  npm run setup-dbs
  ```

5. **Seed the development database:**
  ```sh
  npm run seed
  ```

6. **Run the tests:**
  ```sh
  npm test
  ```

You should now be able to run the project locally.



--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
