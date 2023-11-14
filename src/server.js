const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {

        app.listen(PORT, (err) => {
            if (err) console.error("Error at server launch:", err);
            console.log("Server running. Use our API on port: 5000");
        });
    } catch (error) {
        console.error(`Failed to launch application with error: ${error.message}`);
        process.exit(1);
    }
};

start();