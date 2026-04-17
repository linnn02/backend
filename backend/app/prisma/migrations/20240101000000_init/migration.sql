-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "openalexId" TEXT NOT NULL,
    "doi" TEXT,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "year" INTEGER,
    "venue" TEXT,
    "url" TEXT,
    "citations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "openalexId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationAuthor" (
    "publicationId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "PublicationAuthor_pkey" PRIMARY KEY ("publicationId","authorId")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationKeyword" (
    "publicationId" INTEGER NOT NULL,
    "keywordId" INTEGER NOT NULL,

    CONSTRAINT "PublicationKeyword_pkey" PRIMARY KEY ("publicationId","keywordId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Publication_openalexId_key" ON "Publication"("openalexId");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_doi_key" ON "Publication"("doi");

-- CreateIndex
CREATE INDEX "Publication_title_idx" ON "Publication"("title");

-- CreateIndex
CREATE INDEX "Publication_year_idx" ON "Publication"("year");

-- CreateIndex
CREATE INDEX "Publication_venue_idx" ON "Publication"("venue");

-- CreateIndex
CREATE UNIQUE INDEX "Author_openalexId_key" ON "Author"("openalexId");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- AddForeignKey
ALTER TABLE "PublicationAuthor" ADD CONSTRAINT "PublicationAuthor_publicationId_fkey"
    FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationAuthor" ADD CONSTRAINT "PublicationAuthor_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationKeyword" ADD CONSTRAINT "PublicationKeyword_publicationId_fkey"
    FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationKeyword" ADD CONSTRAINT "PublicationKeyword_keywordId_fkey"
    FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
