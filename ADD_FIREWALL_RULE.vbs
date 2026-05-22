Set UAC = CreateObject("Shell.Application")
UAC.ShellExecute "cmd.exe", "/k netsh advfirewall firewall add rule name=""OrbitX Backend Port 8000"" dir=in action=allow protocol=TCP localport=8000 && echo [OK] Firewall rule added successfully! && echo. && echo Android devices can now connect to the backend. && echo Close this window when done.", "", "runas", 1
