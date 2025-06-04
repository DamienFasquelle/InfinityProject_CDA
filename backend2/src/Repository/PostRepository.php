<?php

namespace App\Repository;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Post>
 *
 * @method Post|null find($id, $lockMode = null, $lockVersion = null)
 * @method Post|null findOneBy(array $criteria, array $orderBy = null)
 * @method Post[]    findAll()
 * @method Post[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    // Exemple de méthode personnalisée, si besoin
    /*
    public function findPostsByTopic(int $topicId): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.topic = :topicId')
            ->setParameter('topicId', $topicId)
            ->orderBy('p.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
    */
}
