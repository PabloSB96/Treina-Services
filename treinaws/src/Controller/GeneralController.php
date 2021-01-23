<?php 
namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\DBAL\Driver\Connection;
use Symfony\Component\HttpFoundation\JsonResponse;

use Doctrine\DBAL\Types\StringType;

class GeneralController {

    /*
     * GET to test API and encoding
     */
    public function test() {
        $data = json_decode('{"id": "TEST","email": "TEST","name": "Pablo","surname": "Sánchez Bello"}', true);
        return new Response(json_encode($data, JSON_UNESCAPED_UNICODE));
    }

    /*
     * Login service for client and trainer
     * TYPE: POST
     * RESPONSES:
     *  - OK
     *  - NOT_FOUND (if user is not found)
     */
    public function login(Request $request, Connection $connection) {
        $parameters = json_decode($request->getContent(), true);
        $email = $parameters['email'];
        $password = $parameters['password'];
        $isTrainer = $parameters['istrainer'];
        $queryBuilder = $connection->createQueryBuilder();
        $data = NULL;
        if ($isTrainer == 1) {
            // Is trainer, then search by these 3 parameters
            $queryBuilder->select('id', 'email', 'name', 'surname')
            ->from('users')
            ->where('email = ?')
            ->andWhere('password = ?')
            ->andWhere('istrainer = ?')
            ->setParameter(0, $email)
            ->setParameter(1, $password)
            ->setParameter(2, $isTrainer)
            ;
            $stm = $queryBuilder->execute();
            $data = $stm->fetch();
        } else {
            // Is client, so get trainer code
            $trainerCode = $parameters['trainercode'];
            $queryBuilder->select('id', 'email', 'name', 'surname')
            ->from('users')
            ->where('email = ?')
            ->andWhere('password = ?')
            ->andWhere('istrainer = ?')
            ->andWhere('trainercode = ?')
            ->setParameter(0, $email)
            ->setParameter(1, $password)
            ->setParameter(2, $isTrainer)
            ->setParameter(3, $trainerCode)
            ;
            $stm = $queryBuilder->execute();
            $data = $stm->fetch();
        }
        if (! $data) {
            return new Response("", Response::HTTP_NOT_FOUND);
        }
        return new Response(json_encode($data, JSON_UNESCAPED_UNICODE));
    }

}
?>