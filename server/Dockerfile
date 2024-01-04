# Use Python as the base image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the container and install dependencies
COPY requirements/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI app files to the container
COPY . .

# Expose port 8000 (default for FastAPI)
EXPOSE 8000

# Command to run the FastAPI application using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
