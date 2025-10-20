## 🧪 Decisões

- Stack principal: O projeto foi desenvolvido com NestJS e TypeORM, utilizando PostgreSQL como banco de dados.

- Escolha do NestJS: Optei pelo NestJS por ser um framework que já propõe uma arquitetura bem definida e modular, o que ajuda no desacoplamento entre responsabilidades.

- Escolha do TypeORM: Utilizei o TypeORM por apreciar o modelo de consultas e a flexibilidade que ele oferece. No entanto, seria perfeitamente possível adotar alternativas como Sequelize ou Prisma, dependendo das necessidades do projeto.

- Vetores e escalabilidade: Para manipulação de vetores, optei por não utilizar bancos especializados como Pinecone ou RedisAI, considerando o escopo reduzido do projeto. Contudo, em um cenário de maior escala, o uso do Pinecone seria a melhor escolha pela performance e escalabilidade que oferece.

- Integração com IA: A integração de inteligência artificial foi feita por meio da API da OpenAI, que atendeu bem às demandas do projeto. Entretanto, plataformas como o Amazon Bedrock oferecem alternativas com múltiplos modelos de LLMs, cada uma com vantagens e desvantagens a serem avaliadas conforme o contexto.

- Deploy: As aplicações foram hospedadas na Railway, utilizando Dockerfile, pela simplicidade e adequação a um ambiente de testes. Para um cenário de produção e maior escalabilidade, a infraestrutura ideal seria na AWS (ou qualquer um serviço de preferencia do time e da empresa como GPC ou Azure), com opções como ECS ou Elastic Beanstalk (mais simples, porém com custo ligeiramente superior).

- Monitoramento e observabilidade: Embora não tenha sido implementado no projeto, seria importante incluir um sistema de logs (como Grafana, CloudWatch ou outro agente de monitoramento) e um mecanismo de tracing, como o AWS X-Ray ou soluções baseadas em OpenTelemetry.