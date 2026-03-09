#commande à executer pour créer les admins (dans le repertoire api): 
# python3 seed.py


from database import SessionLocal
from models import User, Category, Section
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def seed_categories_and_sections():
    db = SessionLocal()
    try:
        default_categories = [
            ("A la Une", "alaune"),
            ("Buzz", "buzz"),
            ("AfroTcham", "afrotcham"),
            ("Rap", "rap"),
            ("Sport", "sport"),
            ("Comedie", "comedie"),
            ("Cinema", "cinema"),
            ("Entrepreneuriat", "entrepreneuriat"),
            ("Sciences", "sciences"),
            ("Arts et Traditions", "arts-traditions"),
        ]

        default_sections = [
            ("A la Une", "alaune"),
            ("Buzz", "buzz"),
            ("Success Stories", "success-stories"),
            ("Resources", "resources"),
            ("Programmes de Soutien", "programmes-de-soutien"),
            ("Contenus Recents", "contenus-recents"),
            ("Sciences", "sciences"),
            ("Arts et Traditions", "arts-traditions"),
        ]

        for name, slug in default_categories:
            exists = db.query(Category).filter(Category.slug == slug).first()
            if not exists:
                db.add(Category(name=name, slug=slug, description=f"Categorie {name}"))
                print(f"✅ Categorie creee: {name}")

        for name, slug in default_sections:
            exists = db.query(Section).filter(Section.slug == slug).first()
            if not exists:
                db.add(Section(name=name, slug=slug, description=f"Section {name}"))
                print(f"✅ Section creee: {name}")

        db.commit()
    except Exception as e:
        print(f"❌ Erreur seed categories/sections: {e}")
        db.rollback()
    finally:
        db.close()

def create_admins(admins_list):
    db = SessionLocal()
    try:
        for admin_data in admins_list:
            # Vérification par email pour éviter les doublons
            exists = db.query(User).filter(User.email == admin_data["email"]).first()
            
            if not exists:
                print(f"🚀 Création de l'admin : {admin_data['email']}...")
                new_admin = User(
                    email=admin_data["email"],
                    username=admin_data["username"],
                    password_hash=pwd_context.hash(admin_data["password"]),
                    role=admin_data.get("role", "admin"),
                    disabled=False
                )
                db.add(new_admin)
                print(f"✅ {admin_data['username']} a été ajouté.")
            else:
                print(f"ℹ️ L'admin {admin_data['email']} existe déjà.")
        
        db.commit()
    except Exception as e:
        print(f"❌ Erreur : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_categories_and_sections()

    # AJOUTE TES ADMINS ICI
    admins_to_create = [
        {
            "email": "eversdevmbini@gmail.com", 
            "username": "eversDevMbini280", 
            "password": "12345678"
        }
    ]
    
    create_admins(admins_to_create)
