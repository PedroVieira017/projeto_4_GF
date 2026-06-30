USE [ONIPVC]
GO

IF COL_LENGTH('dbo.FORMACAO', 'area_formacao_pedagogica') IS NULL
BEGIN
    ALTER TABLE [dbo].[FORMACAO]
    ADD [area_formacao_pedagogica] BIT NOT NULL
        CONSTRAINT [DF__FORMACAO__area_formacao_pedagogica] DEFAULT ((0));
END
GO
