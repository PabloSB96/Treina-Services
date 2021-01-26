<?php 
namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\DBAL\Driver\Connection;
use Symfony\Component\HttpFoundation\JsonResponse;

use Doctrine\DBAL\Types\StringType;

class TrainerController {

    /*
     * Retrive clients for a specific trainer
     * TYPE: GET
     * Response:
     *  - OK
     */
    public function clients(Request $request, Connection $connection) {
        $trainer = $request->query->get('trainer');
        $data = $connection->fetchAll("
            SELECT id, name, surname, photo FROM users WHERE id IN (SELECT client FROM client_trainer WHERE trainer = (SELECT id FROM users WHERE email = '".$trainer."'));"
        );
        return new Response(json_encode($data, JSON_UNESCAPED_UNICODE));
    }

    /*
     * Retrive exercices of a trainer
     * TYPE: GET
     * Response:
     *  - OK
     */
    public function myExercices(Request $request, Connection $connection) {
        $trainer = $request->query->get('trainer');
        $data = $connection->fetchAll("
            SELECT id, title, description FROM trainer_exercices WHERE trainer = (SELECT id FROM users WHERE email = '".$trainer."');"
        );
        return new Response(json_encode($data, JSON_UNESCAPED_UNICODE));
    }

}
?>