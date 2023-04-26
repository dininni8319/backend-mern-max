Packages
#npm install --save express body-parser
#npm install --save-dev nodemon
#npm install express-validator
#npm install --save moongose
#npm i bcrypt
'npm install --save-dev' ---> adds the package into 
the devDependencies
#npm install --save mongoose-unique-validator

#To check with process are running on the port 5000
lsof -i tcp:5000

#Kill the process with the PID
kill -9 <PID>

#or try this one 
sudo pkill node

#or try this one
npx kill-port 5000

kill $(lsof -t -i:3000)

