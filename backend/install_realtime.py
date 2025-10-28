"""
Install and test real-time dependencies
"""
import subprocess
import sys
import importlib.util

def check_package(package_name):
    """Check if a package is installed"""
    spec = importlib.util.find_spec(package_name)
    return spec is not None

def install_package(package):
    """Install a package using pip"""
    print(f"\n[Installing] {package}...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
        print(f"[SUCCESS] {package} installed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to install {package}: {e}")
        return False

def test_imports():
    """Test if all required packages can be imported"""
    print("\n" + "="*60)
    print("TESTING IMPORTS")
    print("="*60)

    packages = {
        'flask_socketio': 'Flask-SocketIO',
        'socketio': 'python-socketio',
    }

    all_ok = True
    for module_name, package_name in packages.items():
        try:
            __import__(module_name)
            print(f"✅ {package_name} - OK")
        except ImportError as e:
            print(f"❌ {package_name} - FAILED: {e}")
            all_ok = False

    return all_ok

def verify_files():
    """Verify that all required files exist and are correct"""
    import os

    print("\n" + "="*60)
    print("VERIFYING FILES")
    print("="*60)

    files_to_check = [
        'services/socket_service.py',
        'extensions.py',
        'app.py',
        'routes/projects.py',
        'routes/votes.py',
    ]

    all_ok = True
    for file_path in files_to_check:
        if os.path.exists(file_path):
            print(f"✅ {file_path} - EXISTS")

            # Check for specific content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

                if file_path == 'services/socket_service.py':
                    if 'SocketService' in content and 'emit_project_created' in content:
                        print(f"   ✅ Contains SocketService class")
                    else:
                        print(f"   ❌ Missing SocketService implementation")
                        all_ok = False

                elif file_path == 'extensions.py':
                    if 'socketio' in content and 'SocketIO' in content:
                        print(f"   ✅ Contains socketio initialization")
                    else:
                        print(f"   ❌ Missing socketio import")
                        all_ok = False

                elif file_path == 'app.py':
                    if 'socketio.run' in content or 'socketio.init_app' in content:
                        print(f"   ✅ Socket.IO integrated")
                    else:
                        print(f"   ❌ Socket.IO not integrated")
                        all_ok = False

                elif file_path == 'routes/projects.py':
                    if 'SocketService.emit_project_created' in content:
                        print(f"   ✅ Emits project events")
                    else:
                        print(f"   ⚠️  No Socket.IO events (optional)")

        else:
            print(f"❌ {file_path} - NOT FOUND")
            all_ok = False

    return all_ok

def test_socket_service():
    """Test if SocketService can be imported"""
    print("\n" + "="*60)
    print("TESTING SOCKET SERVICE")
    print("="*60)

    try:
        from services.socket_service import SocketService
        print("✅ SocketService imported successfully")

        # Check methods exist
        methods = [
            'emit_project_created',
            'emit_project_updated',
            'emit_project_deleted',
            'emit_vote_cast',
            'emit_leaderboard_updated',
        ]

        for method in methods:
            if hasattr(SocketService, method):
                print(f"   ✅ {method} - OK")
            else:
                print(f"   ❌ {method} - MISSING")
                return False

        return True
    except Exception as e:
        print(f"❌ Failed to import SocketService: {e}")
        return False

def main():
    """Main installation and testing flow"""
    print("="*60)
    print("BACKEND REAL-TIME INSTALLATION & TESTING")
    print("="*60)

    # Step 1: Install dependencies
    print("\n[STEP 1] Installing dependencies...")

    packages_to_install = [
        'flask-socketio==5.3.6',
        'python-socketio==5.11.0',
    ]

    for package in packages_to_install:
        if not install_package(package):
            print(f"\n❌ Installation failed for {package}")
            sys.exit(1)

    # Step 2: Test imports
    if not test_imports():
        print("\n❌ Import test failed!")
        sys.exit(1)

    # Step 3: Verify files
    if not verify_files():
        print("\n⚠️  Some files are missing or incomplete")
        print("   But core dependencies are installed.")

    # Step 4: Test SocketService
    if not test_socket_service():
        print("\n⚠️  SocketService test failed")
        print("   But dependencies are installed.")

    # Summary
    print("\n" + "="*60)
    print("INSTALLATION COMPLETE")
    print("="*60)
    print("\n✅ All dependencies installed successfully!")
    print("✅ Flask-SocketIO ready")
    print("✅ python-socketio ready")
    print("\n📝 Next steps:")
    print("   1. Restart backend: python app.py")
    print("   2. Check for '[Socket.IO] Server initialized' in logs")
    print("   3. Test real-time features")

    return True

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Installation script failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
