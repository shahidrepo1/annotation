# Django Annotation Tool Backend

This is the backend for the **Annotation Tool**, built with Django and Django REST Framework (DRF). It provides API endpoints for managing user authentication, file uploads, AI model integrations, and data processing to test and train ai models for multiple modules including Speaker Recognition.

---

## 🚀 Setup Instructions

### 1️⃣ **Clone the Repository**
```bash
git https://github.com/Annotation-Tool-Forbmax/Back-end.git
cd annotation_project
```

### 2️⃣ **Create and Activate Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # For macOS/Linux
venv\Scripts\activate    # For Windows
```

### 3️⃣ **Install Dependencies**
```bash
pip install -r requirements.txt
```

### 5️⃣ **Apply Migrations**
```bash
python manage.py makemigrations

``````bash
python manage.py migrate
```


### 6️⃣ **Load Predefined Labels (OD & TF)**
```bash
python manage.py load_od_labels
python manage.py load_tf_labels
```
> **Note:**  
> Run these commands once after every fresh migration or on a new environment to ensure all required labels (with correct IDs) are present in the database.

### 7️⃣ **Create a Superuser (For Admin Panel)**
```bash
python manage.py createsuperuser
```

### 8️⃣ **Run the Server**
```bash
python manage.py runserver
```

Now, the backend should be running at `http://127.0.0.1:9010/` 🎉

---

## 🔐 Authentication
This project uses **JWT Authentication**.
- To obtain an access token, send a `POST` request to:
  ```http
  POST /api/account/login/
  ```
- Include the token in API requests using:
  ```http
  Authorization: Bearer <your_token>
  ```

---



## 📂 Project Structure
```bash
annotation_project/
│── account/                # User authentication module
│── sr_app/                 # Speaker Recognition API integration
│── stt_app/                # Speech-to-Text API integration
│── media/                  # Uploaded media files
│── annotation_project/     # Main Django project settings
│── .env                    # Environment variables
│── requirements.txt        # Python dependencies
│── manage.py               # Django CLI commands
```

---

## 📝 Notes
- **CSRF Configuration:** CSRF is disabled in development mode.
- **CORS:** The frontend needs to be added to `CORS_ALLOWED_ORIGINS` in `.env`.
- **Database:** The default database is **SQLite**, but you can switch to PostgreSQL by modifying `DATABASES` in `settings.py`.
---

## 🔗 Useful Commands

| Command | Description |
|---------|-------------|
| `python manage.py runserver` | Start the server |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py createsuperuser` | Create an admin user |
| `deactivate` | Exit virtual environment |

---

📧 Contact

For any issues, feel free to reach out at ali.yar@forbmax.ai.

Happy coding! 🚀

test1

