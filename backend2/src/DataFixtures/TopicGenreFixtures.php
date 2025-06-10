<?php

namespace App\DataFixtures;

use App\Entity\TopicGenre;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TopicGenreFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $genre = new TopicGenre();
        $genre->setName('Genre de test');
        $genre->setDescription('Description du genre de test');

        $manager->persist($genre);
        $manager->flush();

        // Si tu souhaites récupérer cet objet dans d'autres fixtures :
        $this->addReference('genre-test', $genre);
    }
}
