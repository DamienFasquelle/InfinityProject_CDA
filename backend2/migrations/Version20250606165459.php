<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250606165459 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE topic_genre (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic ADD genre_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic ADD CONSTRAINT FK_9D40DE1B4296D31F FOREIGN KEY (genre_id) REFERENCES topic_genre (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_9D40DE1B4296D31F ON topic (genre_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE topic DROP FOREIGN KEY FK_9D40DE1B4296D31F
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE topic_genre
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_9D40DE1B4296D31F ON topic
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic DROP genre_id
        SQL);
    }
}
