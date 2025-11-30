# Trabalho Programação Web 2025-2

Este é um projeto de programação web com um backend em Java Spring Boot e um frontend em HTML, CSS e JavaScript.

## Estrutura do Projeto

```
.
├── README.md
├── assets/
├── backend/
├── html/
├── scripts/
└── styles/
```

- `backend/`: Contém a aplicação Spring Boot.
- `html/`, `scripts/`, `styles/`, `assets/`: Contêm os arquivos do frontend.

## Como Rodar a Aplicação

### Pré-requisitos

- [Java JDK 17 ou superior](https://www.oracle.com/java/technologies/downloads/)
- [Apache Maven](https://maven.apache.org/download.cgi)
- Um navegador web moderno.
- (Opcional) [Python](https://www.python.org/downloads/) para servir os arquivos do frontend.

### Backend

1.  **Navegue até o diretório do backend:**

    ```bash
    cd backend
    ```

2.  **Compile e inicie a aplicação Spring Boot:**

    ```bash
    mvn spring-boot:run
    ```

    O servidor backend estará rodando em `http://localhost:8081`.

### Acessando o Console do Banco de Dados H2

Com o backend em execução, você pode acessar a interface gráfica do banco de dados H2.

1.  **Abra seu navegador e acesse:** `http://localhost:8081/h2-console`

2.  **Na tela de login do H2, utilize os seguintes dados:**
    - **JDBC URL:** `jdbc:h2:mem:trabalhowebdb`
    - **User Name:** `sa`
    - **Password:** (deixe em branco)

3.  Clique em **Connect**.

### Frontend

O frontend é composto por arquivos estáticos (HTML, CSS, JS). Você pode abri-los diretamente no seu navegador, mas para que as requisições para o backend funcionem corretamente, é recomendado servi-los através de um servidor web simples.

#### Usando Python (Recomendado)

1.  **Abra um novo terminal na raiz do projeto.**

2.  **Inicie um servidor HTTP simples.** Se você tiver o Python 3 instalado, use o comando:

    ```bash
    python -m http.server
    ```

    Se você tiver o Python 2, use o comando:
    ```bash
    python -m SimpleHTTPServer
    ```
3.  **Acesse o frontend no seu navegador:**

    Abra seu navegador e vá para `http://localhost:8000/html/`. Você será redirecionado para a página de login ou a página principal.

#### Abrindo diretamente no navegador (Não recomendado)

Você pode abrir os arquivos `.html` da pasta `html/` diretamente no seu navegador, mas a funcionalidade que depende do backend (como login e registro) pode não funcionar como esperado devido à política de mesma origem (CORS) do navegador.

## Como Rodar os Testes

### Testes do Backend

1.  **Navegue até o diretório do backend:**

    ```bash
    cd backend
    ```

2.  **Execute os testes Maven:**

    ```bash
    mvn test
    ```

    Os resultados dos testes serão exibidos no console.