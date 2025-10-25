package suite

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func initDB() {

	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println("Warning this loading env did not work")
	}

}

func ConnectDB() (*mongo.Client, error) {
	initDB()
	uri := os.Getenv("MONGO_URI")
	fmt.Println(uri)
	client, err := mongo.Connect(options.Client().ApplyURI(uri))

	if err != nil {
		panic(err)
	}
	fmt.Println("MongoDb connection Successful")
	return client, nil
}
