@echo off
REM Docker Test Script for Windows - Run E2E tests with Docker Compose
setlocal enabledelayedexpansion

echo Starting Docker Test Environment...

REM Start Neo4j test database
echo Starting Neo4j test database...
docker-compose --profile test up -d neo4j-test

REM Wait for Neo4j to be ready
echo Waiting for Neo4j to be ready...
timeout /t 10 /nobreak > nul

:wait_loop
docker-compose exec -T neo4j-test wget --spider -q http://localhost:7474 2>nul
if errorlevel 1 (
    echo Waiting for Neo4j...
    timeout /t 2 /nobreak > nul
    goto wait_loop
)

echo Neo4j test database is ready!

REM Run tests
echo Running E2E tests...
docker-compose --profile test run --rm test

REM Store exit code
set TEST_RESULT=%errorlevel%

REM Cleanup
echo Cleaning up...
docker-compose --profile test down -v

REM Exit with test result
if %TEST_RESULT% equ 0 (
    echo All tests passed!
    exit /b 0
) else (
    echo Tests failed!
    exit /b 1
)
