<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250604151453 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DF675F31B
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_5A8A6C8DF675F31B ON post
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE post ADD id_user_id INT DEFAULT NULL, DROP author_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D79F37AE5 FOREIGN KEY (id_user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5A8A6C8D79F37AE5 ON post (id_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic DROP FOREIGN KEY FK_9D40DE1BF675F31B
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_9D40DE1BF675F31B ON topic
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic ADD id_user_id INT DEFAULT NULL, DROP author_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic ADD CONSTRAINT FK_9D40DE1B79F37AE5 FOREIGN KEY (id_user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_9D40DE1B79F37AE5 ON topic (id_user_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D79F37AE5
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_5A8A6C8D79F37AE5 ON post
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE post ADD author_id INT NOT NULL, DROP id_user_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DF675F31B FOREIGN KEY (author_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5A8A6C8DF675F31B ON post (author_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic DROP FOREIGN KEY FK_9D40DE1B79F37AE5
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_9D40DE1B79F37AE5 ON topic
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic ADD author_id INT NOT NULL, DROP id_user_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE topic ADD CONSTRAINT FK_9D40DE1BF675F31B FOREIGN KEY (author_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_9D40DE1BF675F31B ON topic (author_id)
        SQL);
    }
}
