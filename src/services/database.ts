// IndexedDB Database Service
// This provides a local IndexedDB database for survey data with complete privacy
// No external dependencies required - uses browser's built-in IndexedDB

export interface Survey {
  id: number;
  title: string;
  description: string;
  questions: any[];
  categories: string[];
  version: string;
  lastUpdated: string;
  updatedBy: string;
  createdAt: string;
  publishedAt?: string;
}

export interface Response {
  id: number;
  surveyId: string;
  sessionToken: string;
  answers: any;
  timestamp: string;
  isAdmin: boolean;
  syncedAt?: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  createdAt: string;
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'AfrilandSurveyDB';
  private readonly DB_VERSION = 1;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await this.openDatabase();
      this.isInitialized = true;
      console.log('✅ IndexedDB database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create surveys store
        if (!db.objectStoreNames.contains('surveys')) {
          const surveyStore = db.createObjectStore('surveys', { keyPath: 'id', autoIncrement: true });
          surveyStore.createIndex('title', 'title', { unique: false });
          surveyStore.createIndex('version', 'version', { unique: false });
          surveyStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Create responses store
        if (!db.objectStoreNames.contains('responses')) {
          const responseStore = db.createObjectStore('responses', { keyPath: 'id', autoIncrement: true });
          responseStore.createIndex('surveyId', 'surveyId', { unique: false });
          responseStore.createIndex('sessionToken', 'sessionToken', { unique: false });
          responseStore.createIndex('timestamp', 'timestamp', { unique: false });
          responseStore.createIndex('surveyId_sessionToken', ['surveyId', 'sessionToken'], { unique: false });
        }

        // Create admins store
        if (!db.objectStoreNames.contains('admins')) {
          const adminStore = db.createObjectStore('admins', { keyPath: 'id' });
          adminStore.createIndex('username', 'username', { unique: true });
        }

        // Create default admin if not exists
        adminStore.transaction.oncomplete = () => {
          this.createDefaultAdmin(db);
        };
      };
    });
  }

  private async createDefaultAdmin(db: IDBDatabase): Promise<void> {
    try {
      const transaction = db.transaction(['admins'], 'readwrite');
      const store = transaction.objectStore('admins');
      const request = store.get('admin_1');

      request.onsuccess = () => {
        if (!request.result) {
          const defaultAdmin: Admin = {
            id: 'admin_1',
            username: 'admin',
            password: 'afriland2026',
            name: 'Administrateur Principal',
            createdAt: new Date().toISOString()
          };
          store.add(defaultAdmin);
          console.log('✅ Default admin account created');
        }
      };
    } catch (error) {
      console.error('Failed to create default admin:', error);
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  // Survey operations
  async saveSurvey(surveyData: any): Promise<Survey> {
    this.ensureInitialized();

    const surveyWithMetadata: Survey = {
      ...surveyData,
      version: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
      updatedBy: this.getCurrentAdminId(),
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['surveys'], 'readwrite');
      const store = transaction.objectStore('surveys');
      const request = store.add(surveyWithMetadata);

      request.onsuccess = () => {
        resolve(surveyWithMetadata);
      };

      request.onerror = () => {
        reject(new Error('Failed to save survey'));
      };
    });
  }

  async getLatestSurvey(): Promise<Survey | null> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['surveys'], 'readonly');
      const store = transaction.objectStore('surveys');
      const index = store.index('lastUpdated');
      const request = index.openCursor(null, 'prev');

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          resolve(cursor.value as Survey);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error('Failed to get latest survey'));
      };
    });
  }

  async getSurveyById(id: number): Promise<Survey | null> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['surveys'], 'readonly');
      const store = transaction.objectStore('surveys');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to get survey'));
      };
    });
  }

  async getAllSurveys(): Promise<Survey[]> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['surveys'], 'readonly');
      const store = transaction.objectStore('surveys');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get surveys'));
      };
    });
  }

  // Response operations
  async saveResponse(responseData: any): Promise<Response | null> {
    this.ensureInitialized();

    const isAdmin = responseData.isAdmin || false;
    const sessionToken = responseData.sessionToken;

    // Check for duplicate responses (regular users only)
    if (!isAdmin) {
      const hasResponded = await this.hasUserResponded(responseData.surveyId, sessionToken);
      if (hasResponded) {
        return null; // Duplicate prevented
      }
    }

    const response: Response = {
      surveyId: responseData.surveyId,
      sessionToken: sessionToken,
      answers: responseData.answers,
      timestamp: responseData.timestamp || new Date().toISOString(),
      isAdmin: isAdmin,
      syncedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');
      const request = store.add(response);

      request.onsuccess = () => {
        resolve({ ...response, id: (request.result as any) });
      };

      request.onerror = () => {
        reject(new Error('Failed to save response'));
      };
    });
  }

  async getResponsesBySurvey(surveyId: string): Promise<Response[]> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readonly');
      const store = transaction.objectStore('responses');
      const index = store.index('surveyId');
      const request = index.getAll(surveyId);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get responses'));
      };
    });
  }

  async getAllResponses(): Promise<Response[]> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readonly');
      const store = transaction.objectStore('responses');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get responses'));
      };
    });
  }

  async getResponseById(id: number): Promise<Response | null> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readonly');
      const store = transaction.objectStore('responses');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to get response'));
      };
    });
  }

  async hasUserResponded(surveyId: string, sessionToken: string): Promise<boolean> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readonly');
      const store = transaction.objectStore('responses');
      const index = store.index('surveyId_sessionToken');
      const request = index.get([surveyId, sessionToken]);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to check user response'));
      };
    });
  }

  async deleteResponse(id: number): Promise<boolean> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete response'));
      };
    });
  }

  // Admin operations
  async getAdmins(): Promise<Admin[]> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readonly');
      const store = transaction.objectStore('admins');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get admins'));
      };
    });
  }

  async addAdmin(username: string, password: string, name: string): Promise<boolean> {
    this.ensureInitialized();

    const admin: Admin = {
      id: 'admin_' + Date.now(),
      username,
      password,
      name,
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readwrite');
      const store = transaction.objectStore('admins');
      const request = store.add(admin);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        resolve(false); // Likely duplicate username
      };
    });
  }

  async deleteAdmin(adminId: string): Promise<boolean> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readwrite');
      const store = transaction.objectStore('admins');
      const request = store.delete(adminId);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete admin'));
      };
    });
  }

  async updateAdminPassword(adminId: string, newPassword: string): Promise<boolean> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readwrite');
      const store = transaction.objectStore('admins');

      const getRequest = store.get(adminId);
      getRequest.onsuccess = () => {
        const admin = getRequest.result;
        if (admin) {
          admin.password = newPassword;
          const putRequest = store.put(admin);
          putRequest.onsuccess = () => resolve(true);
          putRequest.onerror = () => reject(new Error('Failed to update admin'));
        } else {
          resolve(false);
        }
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get admin'));
      };
    });
  }

  // Utility methods
  private getCurrentAdminId(): string {
    // This would typically come from the auth context
    return 'system';
  }

  // Backup operations
  async exportDatabase(): Promise<string> {
    this.ensureInitialized();

    const surveys = await this.getAllSurveys();
    const responses = await this.getAllResponses();
    const admins = await this.getAdmins();

    const exportData = {
      version: this.DB_VERSION,
      exportDate: new Date().toISOString(),
      surveys,
      responses,
      admins
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importDatabase(jsonData: string): Promise<void> {
    this.ensureInitialized();

    const data = JSON.parse(jsonData);

    // Import surveys
    for (const survey of data.surveys || []) {
      await this.saveSurvey(survey);
    }

    // Import responses
    for (const response of data.responses || []) {
      await this.saveResponse(response);
    }

    // Import admins
    for (const admin of data.admins || []) {
      await this.addAdmin(admin.username, admin.password, admin.name);
    }
  }

  async getStats(): Promise<{
    surveys: number;
    responses: number;
    admins: number;
    databaseSize: number;
  }> {
    this.ensureInitialized();

    const surveys = await this.getAllSurveys();
    const responses = await this.getAllResponses();
    const admins = await this.getAdmins();

    // Estimate database size
    const exportData = await this.exportDatabase();
    const databaseSize = new Blob([exportData]).size;

    return {
      surveys: surveys.length,
      responses: responses.length,
      admins: admins.length,
      databaseSize
    };
  }

  async clearAllData(): Promise<void> {
    this.ensureInitialized();

    // Clear all stores
    const stores = ['surveys', 'responses'];
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
      });
    }

    console.log('✅ All data cleared');
  }

  disconnect(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
    console.log('✅ Database disconnected');
  }
}

// Singleton instance
let dbInstance: DatabaseService | null = null;

export const getDatabase = (): DatabaseService => {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
};

export const closeDatabase = (): void => {
  if (dbInstance) {
    dbInstance.disconnect();
    dbInstance = null;
  }
};

export default DatabaseService;