import './pre-start'; // Must be the first import
import logger from 'jet-logger';
import cluster from 'node:cluster';
import os from "node:os";
import process from "node:process";
import envVars from '@shared/env-vars';
import server from './server';


// Constants
const serverStartMsg = 'Express server started on port: ';

// if(cluster.isPrimary === true){
//   const totalCPUs = os.cpus().length;
//   console.log(`Number of CPUs is ${totalCPUs}`);
//   console.log(`Master ${process.pid} is running`);
//
//   // Fork workers.
//   for (let i = 0; i < totalCPUs; i++) {
//     cluster.fork();
//   }
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//     console.log("Let's fork another worker!");
//     cluster.fork();
//   });
// } else {
  // Start server
  server.listen(envVars.port, () => {
    logger.info(serverStartMsg + envVars.port.toString());
  });
// }
