<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250607134731 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE topic ADD CONSTRAINT FK_9D40DE1B4296D31F FOREIGN KEY (genre_id) REFERENCES topic_genre (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_9D40DE1B4296D31F ON topic (genre_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD reset_token VARCHAR(255) DEFAULT NULL, ADD reset_token_expires_at DATETIME DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE topic DROP FOREIGN KEY FK_9D40DE1B4296D31F
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_9D40DE1B4296D31F ON topic
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user DROP reset_token, DROP reset_token_expires_at
        SQL);
    }
}
