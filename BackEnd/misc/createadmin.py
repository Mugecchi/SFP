import mysql.connector
import bcrypt

# Database Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="sfp"
)
cursor = db.cursor()

# Dummy Users to Add
users = [
    {
        "username": "admin1",
        "password": "Admin@123",
        "role": "admin",
        "firstname": "System",
        "middlename": "Admin",
        "lastname": "User",
        "office": "IT Department",
        "email": "admin1@example.com"
    },
    {
        "username": "teacher1",
        "password": "Teach@123",
        "role": "teacher",
        "firstname": "Anna",
        "middlename": "Maria",
        "lastname": "Santos",
        "office": "Education Office",
        "email": "teacher1@example.com"
    },
    {
        "username": "nutri1",
        "password": "Nutri@123",
        "role": "nutritionist",
        "firstname": "Carlos",
        "middlename": "Reyes",
        "lastname": "Fernandez",
        "office": "Health and Nutrition",
        "email": "nutri1@example.com"
    }
]

# Insert each user
for user in users:
    hashed_pw = bcrypt.hashpw(user["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    cursor.execute(
        """
        INSERT INTO users (
            username, password, role,
            user_firstname, user_middlename, user_lastname,
            user_office, user_email
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            user["username"], hashed_pw, user["role"],
            user["firstname"], user["middlename"], user["lastname"],
            user["office"], user["email"]
        )
    )

db.commit()
print("✅ Dummy users (admin, teacher, nutritionist) created successfully!")

cursor.close()
db.close()

