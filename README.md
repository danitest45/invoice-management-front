# Invoice Management Frontend

Este projeto é uma **extensão do Desafio Técnico para Desenvolvedor de Software Pleno (.NET / C#)**, desenvolvido como um **diferencial adicional** para demonstrar a integração ponta a ponta entre **backend e frontend**.

A proposta desta aplicação é consumir a API desenvolvida no teste técnico e oferecer uma interface visual simples, moderna e funcional para gerenciamento de faturas.

---

## Objetivo

Este frontend foi criado como uma **camada complementar ao backend do desafio**, permitindo:

* visualização das faturas
* filtros por cliente, período e status
* criação de novas faturas
* adição de itens
* fechamento de faturas
* visualização detalhada dos itens

O objetivo foi demonstrar uma solução **full stack**, indo além do escopo mínimo solicitado no teste.

---

## Tecnologias utilizadas

* **Next.js**
* **TypeScript**
* **Tailwind CSS**
* **Axios**
* **React**

---

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

* **Node.js 18+**
* **npm**
* **Visual Studio Code** (opcional, recomendado)
* **Backend da API em execução**

---

## Como executar o frontend

### 1. Clone o repositório

```bash
git clone https://github.com/danitest45/invoice-management-front.git
```

---

### 2. Instale as dependências

```bash
npm install
```

Caso necessário, instale o axios manualmente:

```bash
npm install axios
```

---

### 3. Configure a URL da API

Crie um arquivo:

```text
.env.local
```

com o conteúdo:

```env
NEXT_PUBLIC_API_URL=https://localhost:44323
```

> Ajuste a porta conforme a URL gerada ao executar o backend.

---

### 4. Execute o projeto

```bash
npm run dev
```

---

### 5. Acesse no navegador

```text
http://localhost:3000
```

---

## Integração com backend

Este frontend depende da API do projeto backend estar em execução.

Repositório do backend:

[Backend do desafio técnico]([https://github.com/topics/invoice-management?utm_source=chatgpt.com](https://github.com/danitest45/InvoiceManagement))

Antes de iniciar o frontend, execute o backend normalmente pelo Visual Studio.

---

## Funcionalidades implementadas

* Dashboard inicial com listagem de invoices
* filtro padrão por invoices abertas
* filtros avançados por:

  * cliente
  * data inicial
  * data final
  * status
* criação de nova invoice
* adição de item
* fechamento de invoice
* exibição de detalhes e itens

---

## Observação

Este projeto foi desenvolvido como **extensão do teste técnico de Desenvolvedor Pleno**, com o objetivo de agregar valor à entrega e demonstrar visão de produto, integração entre camadas e preocupação com experiência do usuário.
