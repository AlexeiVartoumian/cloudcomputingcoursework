package suite

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func initEnv() {

	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println("Warning this loading env did not work")
	}

}

func initApp() string {
	initEnv()
	app_ip := os.Getenv("APP_IP")

	fmt.Println(app_ip)
	if len(app_ip) < 1 {
		panic("Warning AppIp did not load")
	}
	return app_ip

}

func ConnectDB() (*mongo.Client, error) {
	initEnv()
	uri := os.Getenv("MONGO_URI")
	fmt.Println(uri)
	client, err := mongo.Connect(options.Client().ApplyURI(uri))

	if err != nil {
		panic(err)
	}
	fmt.Println("MongoDb connection Successful")
	return client, nil
}
