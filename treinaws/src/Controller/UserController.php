<?php 
namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\DBAL\Driver\Connection;
use Symfony\Component\HttpFoundation\JsonResponse;

use Doctrine\DBAL\Types\StringType;

class UserController {
    public function test() {
        /*return new Response(
            '<html><body>Hello World! Soy el primer usuario de í í á á Á É Í Docker ccc!</body></html>'
        );*/
        return new JsonResponse(json_decode('{"id": "TEST","email": "TEST","name": "Pablo","surname": "Sánchez Bello"}', true));
    }

    public function login(Request $request, Connection $connection) {
        $parameters = json_decode($request->getContent(), true);
        $email = $parameters['email'];
        $password = $parameters['password'];
        $isTrainer = $parameters['istrainer'];
        $queryBuilder = $connection->createQueryBuilder();
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
        // var_dump($data);
        // return new JsonResponse(mb_convert_encoding($data, 'UTF-8', 'ISO-8859-1'));
        // var_dump(".---------------------.");
        // var_dump(mb_detect_encoding(mb_convert_encoding($data, 'WINDOWS-1252', 'UTF-8'), 'ISO-8859-1', true));
        // var_dump(mb_detect_encoding(mb_convert_encoding($data, 'WINDOWS-1252', 'UTF-8'), 'UTF-8', true));
        // return new JsonResponse(mb_convert_encoding(mb_convert_encoding($data, 'WINDOWS-1252', 'UTF-8'), 'ISO-8859-1', 'UTF-8'));
        return new JsonResponse($data);

        // ->getSingleResult();

        //return new Response("<html><body>emial: ".$email." - password: ".$password."</body></html>");

    }

    /*public function login() {
        return new Response(
            '<html><body>Login function</body></html>'
        );
    }*/

    public function getUsers(Connection $connection) {
        $result = $connection->fetchAll('SELECT * FROM users');
        return new JsonResponse($result);
    }

    public function createUser(Request $request, Connection $connection) {
        $name = $request->query->get('nombre');
        $lastname = $request->query->get('apellido');
        $email = $request->query->get('email');

        $count = $connection->executeUpdate("
            INSERT INTO `db`.`users` (`name`, `lastname`, `email`)
            VALUES ('".$name."', '".$lastname."', '".$email."');
        ");

        return new Response($count == 1 ? 'Usuario guardado' : 'No se ha podido guardar el usuario');
    }
}
?>