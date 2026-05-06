// Error Handling Utilities
// This file provides comprehensive error handling for database operations

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  userFriendlyMessage: string;
  retryable: boolean;
}

export class DatabaseErrorHandler {
  // Parse error from database operations
  static parseDatabaseError(error: any): AppError {
    const timestamp = new Date();

    // Network errors
    if (!navigator.onLine) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network connection is offline',
        timestamp,
        userFriendlyMessage: 'Vous êtes hors ligne. Vérifiez votre connexion internet.',
        retryable: true
      };
    }

    // Timeout errors
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        message: error.message || 'Request timed out',
        timestamp,
        userFriendlyMessage: 'La demande a expiré. Veuillez réessayer.',
        retryable: true
      };
    }

    // Database-specific errors
    if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE constraint')) {
      return {
        type: ErrorType.CONFLICT_ERROR,
        message: 'Duplicate entry detected',
        timestamp,
        userFriendlyMessage: 'Cette entrée existe déjà. Veuillez utiliser une valeur différente.',
        retryable: false
      };
    }

    if (error.code === 'SQLITE_NOTFOUND' || error.message?.includes('no such table')) {
      return {
        type: ErrorType.NOT_FOUND_ERROR,
        message: 'Database table not found',
        timestamp,
        userFriendlyMessage: 'La base de données n\'est pas correctement configurée.',
        retryable: false
      };
    }

    if (error.code === 'SQLITE_BUSY' || error.message?.includes('database is locked')) {
      return {
        type: ErrorType.DATABASE_ERROR,
        message: 'Database is busy',
        timestamp,
        userFriendlyMessage: 'La base de données est occupée. Veuillez réessayer dans quelques instants.',
        retryable: true
      };
    }

    // Generic error
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
      timestamp,
      userFriendlyMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      retryable: true
    };
  }

  // Create error from exception
  static fromException(exception: any): AppError {
    if (exception instanceof AppError) {
      return exception;
    }

    return this.parseDatabaseError(exception);
  }

  // Log error for debugging
  static logError(error: AppError, context?: string): void {
    console.error(`[${context || 'App'}] Error:`, {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      details: error.details
    });
  }

  // Get user-friendly error message
  static getUserMessage(error: AppError): string {
    return error.userFriendlyMessage;
  }

  // Check if error is retryable
  static isRetryable(error: AppError): boolean {
    return error.retryable;
  }
}

export class ErrorBoundaryHelper {
  // Handle component errors
  static handleComponentError(error: Error, errorInfo: any): AppError {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message,
      details: {
        componentStack: errorInfo.componentStack,
        errorStack: error.stack
      },
      timestamp: new Date(),
      userFriendlyMessage: 'Une erreur s\'est produite dans l\'application. Veuillez rafraîchir la page.',
      retryable: true
    };
  }

  // Get error recovery suggestions
  static getRecoverySuggestions(error: AppError): string[] {
    const suggestions: string[] = [];

    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        suggestions.push('Vérifiez votre connexion internet');
        suggestions.push('Essayez de rafraîchir la page');
        break;

      case ErrorType.DATABASE_ERROR:
        suggestions.push('Attendez quelques instants et réessayez');
        suggestions.push('Si le problème persiste, contactez le support technique');
        break;

      case ErrorType.VALIDATION_ERROR:
        suggestions.push('Vérifiez les données saisies');
        suggestions.push('Assurez-vous que tous les champs requis sont remplis');
        break;

      case ErrorType.AUTHENTICATION_ERROR:
        suggestions.push('Vérifiez vos identifiants de connexion');
        suggestions.push('Déconnectez-vous et reconnectez-vous');
        break;

      default:
        suggestions.push('Rafraîchissez la page');
        suggestions.push('Si le problème persiste, contactez le support technique');
    }

    return suggestions;
  }

  // Format error for display
  static formatErrorForDisplay(error: AppError): {
    title: string;
    message: string;
    suggestions: string[];
    canRetry: boolean;
  } {
    return {
      title: this.getErrorTitle(error.type),
      message: error.userFriendlyMessage,
      suggestions: this.getRecoverySuggestions(error),
      canRetry: error.retryable
    };
  }

  private static getErrorTitle(type: ErrorType): string {
    const titles: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: 'Erreur de connexion',
      [ErrorType.AUTHENTICATION_ERROR]: 'Erreur d\'authentification',
      [ErrorType.AUTHORIZATION_ERROR]: 'Erreur d\'autorisation',
      [ErrorType.VALIDATION_ERROR]: 'Erreur de validation',
      [ErrorType.CONFLICT_ERROR]: 'Conflit de données',
      [ErrorType.NOT_FOUND_ERROR]: 'Ressource non trouvée',
      [ErrorType.RATE_LIMIT_ERROR]: 'Trop de demandes',
      [ErrorType.TIMEOUT_ERROR]: 'Délai d\'attente expiré',
      [ErrorType.DATABASE_ERROR]: 'Erreur de base de données',
      [ErrorType.UNKNOWN_ERROR]: 'Erreur inconnue'
    };

    return titles[type] || 'Erreur';
  }
}

// Export types and classes
export { DatabaseErrorHandler, ErrorBoundaryHelper };