USE [ONIPVC]
GO

IF COL_LENGTH('dbo.FORMACAO', 'certificado_automatico') IS NULL
BEGIN
    ALTER TABLE [dbo].[FORMACAO]
    ADD [certificado_automatico] BIT NOT NULL
        CONSTRAINT [DF__FORMACAO__certificado_automatico] DEFAULT ((0));
END
GO

IF COL_LENGTH('dbo.FORMACAO', 'certificado_logotipos') IS NULL
BEGIN
    ALTER TABLE [dbo].[FORMACAO]
    ADD [certificado_logotipos] NVARCHAR(MAX) NULL;
END
GO

IF COL_LENGTH('dbo.FORMACAO', 'certificado_titulo') IS NULL
BEGIN
    ALTER TABLE [dbo].[FORMACAO]
    ADD [certificado_titulo] NVARCHAR(250) NULL;
END
GO

IF COL_LENGTH('dbo.FORMACAO', 'certificado_descricao') IS NULL
BEGIN
    ALTER TABLE [dbo].[FORMACAO]
    ADD [certificado_descricao] NVARCHAR(MAX) NULL;
END
GO

IF COL_LENGTH('dbo.FORMACAO', 'certificado_config') IS NULL
BEGIN
    ALTER TABLE [dbo].[FORMACAO]
    ADD [certificado_config] NVARCHAR(MAX) NULL;
END
GO
