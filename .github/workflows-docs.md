# Workflow scripts docs

***IMPORTANT***                           

- **env variables must be set to run scripts.** 
STACK_NAME, DOMAIN_NAME, SERVER_PORT, CLIENT_PORT    
            
- **Staging STACK_NAME must be named "staging".** 

Production workflow scripts copies image tags from staging.yml file, which is named after STACK_NAME.                       
Also, newly deployed staging version will copy tag from prev-staging.yml if there is no new image tag for a service.                           
*Stacks other than staging can have any name.*

- Yaml file generation

 Generated (.github/workflows/jobs/create-stack.sh) with `envsubst` from file .github/workflows/stacks/stack.yml.

services & images name must match this pattern:
	```yml
  ${PROJECT_LOWER}-${STACK_NAME}-service_name:
    image: ghcr.io/${REPO_LOWER}-service_name:image-placeholder
	```                  

Backend service must be named "server". Migrations service depends on it and uses the same image, and this name will be used to scale the backend on the Ubuntu server.                                    
Migrations service (excluded from healthchecks) must be named "migrations".                             
Frontend should be named "client", although this name is only used in the remote images removal process.

- *Some scripts use variables set in format-name.sh (REPO_LOWER, PROJECT_LOWER).*

- **All docker secrets in stacks/stack.yml must be registered on the Ubuntu server.**

`echo "secret" | docker secret create secret_name -`

## Deployment scripts (Ubuntu server)

**CD to directory before running scripts.**                            
**Database is backed up before deployment. If deployment fails, said backup is restored.**

- docker-login.sh

Writes .docker/config.json file and logs in to ghcr.io.           
Uses DOCKER_AUTH GitHub secret, generated with `echo -n "username:PAT" | base64`.                  
This script can be improved by using a better approach than writing file ~/.docker/config.json file.

- replace-placeholders.sh

Replaces image-placeholder in new yaml file. 

For staging: if no new image were created for a service, copies the corresponding image tag from prev-staging yaml file.           
For production: copies the image tags for all services from staging.yml file.

- check-services-health.sh

Loops through services ($STACK_NAME) and checks if they're healthy.          
Excludes migrations service (runs just once).             
Calls rollback.sh if health checks are unsuccessful after 5 minutes.

- rollback.sh

Called by check-service-health.sh.                  
Archives yaml file associated with failed deployment in failed/ folder, with timestamps. Removes the oldest archived files.             
Renames prev-"$STACK_NAME".yml to "$STACK_NAME".yml. Deploys the previous version with it.                  
Calls docker-logout.sh

- post-job.sh

Makes new yaml file read-only.                                    
Scales server service to 2.                 
Cleans up (remove-old-images.sh, docker-logout.sh).                  
Logs available images.                    

- remove-old-images.sh

Keeps only the most recent (3) images for each service.
