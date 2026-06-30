/****** Object:  Database [ONIPVC]    Script Date: 22/10/2025 14:14:43 ******/
CREATE DATABASE [ONIPVC]
GO
ALTER DATABASE [ONIPVC] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [ONIPVC].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [ONIPVC] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [ONIPVC] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [ONIPVC] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [ONIPVC] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [ONIPVC] SET ARITHABORT OFF 
GO
ALTER DATABASE [ONIPVC] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [ONIPVC] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [ONIPVC] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [ONIPVC] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [ONIPVC] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [ONIPVC] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [ONIPVC] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [ONIPVC] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [ONIPVC] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [ONIPVC] SET  DISABLE_BROKER 
GO
ALTER DATABASE [ONIPVC] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [ONIPVC] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [ONIPVC] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [ONIPVC] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [ONIPVC] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [ONIPVC] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [ONIPVC] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [ONIPVC] SET RECOVERY FULL 
GO
ALTER DATABASE [ONIPVC] SET  MULTI_USER 
GO
ALTER DATABASE [ONIPVC] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [ONIPVC] SET DB_CHAINING OFF 
GO
ALTER DATABASE [ONIPVC] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [ONIPVC] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [ONIPVC] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [ONIPVC] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'ONIPVC', N'ON'
GO
ALTER DATABASE [ONIPVC] SET QUERY_STORE = ON
GO
ALTER DATABASE [ONIPVC] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [ONIPVC]
GO
/****** Object:  Schema [exemplo]    Script Date: 22/10/2025 14:14:43 ******/
CREATE SCHEMA [exemplo]
GO
/****** Object:  Table [dbo].[not_excepcao]    Script Date: 22/10/2025 14:14:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[not_excepcao](
	[id_excepcao] [int] NOT NULL,
	[id_tipo_notificacao] [int] NULL,
	[email_destinatario] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_excepcao] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[not_notificacao]    Script Date: 22/10/2025 14:14:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[not_notificacao](
	[id_notificacao] [int] IDENTITY(1,1) NOT NULL,
	[data_criacao] [datetime] NULL,
	[data_envio] [datetime] NULL,
	[email_destinatario] [nvarchar](4000) NULL,
	[assunto] [nvarchar](max) NULL,
	[mensagem] [nvarchar](max) NULL,
	[id_tipo_notificacao] [int] NULL,
	[estado] [int] NULL,
	[periodicidade] [nvarchar](255) NULL,
	[identificador_chave] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_notificacao] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[not_regra]    Script Date: 22/10/2025 14:14:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[not_regra](
	[id_regra] [int] NOT NULL,
	[activa] [bit] NOT NULL,
	[tabela_base] [nvarchar](255) NULL,
	[trg] [nvarchar](255) NULL,
	[periodicidade] [nvarchar](255) NULL,
	[assunto] [nvarchar](4000) NULL,
	[mensagem] [nvarchar](4000) NULL,
	[descricao_regra] [nvarchar](4000) NULL,
	[id_tipo_notificacao] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id_regra] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[not_tipo_notificacao]    Script Date: 22/10/2025 14:14:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[not_tipo_notificacao](
	[id_tipo_notificacao] [int] NOT NULL,
	[descricao] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_tipo_notificacao] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [exemplo].[editora]    Script Date: 22/10/2025 14:14:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [exemplo].[editora](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[designacao] [nvarchar](250) NOT NULL,
	[nif] [nvarchar](20) NULL,
 CONSTRAINT [PK_editora] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [exemplo].[livros]    Script Date: 22/10/2025 14:14:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [exemplo].[livros](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[designacao] [nvarchar](250) NOT NULL,
	[ISBN] [nvarchar](20) NOT NULL,
	[preco_unitario] [decimal](18, 2) NOT NULL,
	[qnt_stock] [int] NOT NULL,
	[editora_id] [int] NOT NULL,
	[autores] [nvarchar](250) NOT NULL,
 CONSTRAINT [PK_exemplo.livros] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [exemplo].[vendas]    Script Date: 22/10/2025 14:14:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [exemplo].[vendas](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[livro_id] [int] NOT NULL,
	[preco_unitario] [decimal](18, 2) NOT NULL,
	[qnt] [int] NOT NULL,
	[preco_total] [decimal](18, 2) NOT NULL,
	[iva] [decimal](18, 2) NOT NULL,
	[id_utilizador] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_vendas] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [exemplo].[editora] ON 
GO
INSERT [exemplo].[editora] ([id], [designacao], [nif]) VALUES (6, N'Porto Editora', N'132432432')
GO
INSERT [exemplo].[editora] ([id], [designacao], [nif]) VALUES (7, N'Leya', N'543543534')
GO
INSERT [exemplo].[editora] ([id], [designacao], [nif]) VALUES (8, N'Teste nova', N'123456789')
GO
INSERT [exemplo].[editora] ([id], [designacao], [nif]) VALUES (9, N'Teste update', N'297402684')
GO
INSERT [exemplo].[editora] ([id], [designacao], [nif]) VALUES (10, N'fas', N'123456789')
GO
INSERT [exemplo].[editora] ([id], [designacao], [nif]) VALUES (11, N'fa', N'123456789')
GO
SET IDENTITY_INSERT [exemplo].[editora] OFF
GO
ALTER TABLE [dbo].[not_excepcao]  WITH CHECK ADD FOREIGN KEY([id_tipo_notificacao])
REFERENCES [dbo].[not_tipo_notificacao] ([id_tipo_notificacao])
GO
ALTER TABLE [dbo].[not_excepcao]  WITH CHECK ADD FOREIGN KEY([id_tipo_notificacao])
REFERENCES [dbo].[not_tipo_notificacao] ([id_tipo_notificacao])
GO
ALTER TABLE [dbo].[not_notificacao]  WITH CHECK ADD FOREIGN KEY([id_tipo_notificacao])
REFERENCES [dbo].[not_tipo_notificacao] ([id_tipo_notificacao])
GO
ALTER TABLE [dbo].[not_notificacao]  WITH CHECK ADD FOREIGN KEY([id_tipo_notificacao])
REFERENCES [dbo].[not_tipo_notificacao] ([id_tipo_notificacao])
GO
ALTER TABLE [dbo].[not_regra]  WITH CHECK ADD  CONSTRAINT [FK__not_regra__id_ti__748F2482] FOREIGN KEY([id_tipo_notificacao])
REFERENCES [dbo].[not_tipo_notificacao] ([id_tipo_notificacao])
GO
ALTER TABLE [dbo].[not_regra] CHECK CONSTRAINT [FK__not_regra__id_ti__748F2482]
GO
USE [master]
GO
ALTER DATABASE [ONIPVC] SET  READ_WRITE 
GO
