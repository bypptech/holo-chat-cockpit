import { HttpAgent, Actor, ActorSubclass } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';

// ICP Canister IDL for gacha drive operations
const idlFactory = ({ IDL }: { IDL: any }) => {
  return IDL.Service({
    'gacha_drive_request': IDL.Func([IDL.Text], [IDL.Text], []),
  });
};

export interface DriveOperationResult {
  success: boolean;
  message: string;
  canisterResponse?: string;
  error?: string;
}

export interface DriveOperationCallbacks {
  onStart?: () => void;
  onSuccess?: (result: string) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
  onCountdownUpdate?: (seconds: number) => void;
}

class DriveOperationService {
  private static instance: DriveOperationService;
  private isOperationInProgress = false;
  private countdownTimer: any = null;

  static getInstance(): DriveOperationService {
    if (!DriveOperationService.instance) {
      DriveOperationService.instance = new DriveOperationService();
    }
    return DriveOperationService.instance;
  }

  async executeDriveOperation(
    token: string,
    callbacks?: DriveOperationCallbacks
  ): Promise<DriveOperationResult> {
    // Prevent multiple concurrent operations
    if (this.isOperationInProgress) {
      return {
        success: false,
        message: 'Drive operation already in progress',
        error: 'OPERATION_IN_PROGRESS'
      };
    }

    this.isOperationInProgress = true;
    callbacks?.onStart?.();

    try {
      // Call the backend canister
      const canisterResponse = await this.callBackendCanister(token);
      
      // Start 10-second countdown
      await this.startCountdown(callbacks);

      callbacks?.onSuccess?.(canisterResponse);

      return {
        success: true,
        message: 'Drive operation completed successfully',
        canisterResponse
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks?.onError?.(errorMessage);
      
      this.isOperationInProgress = false;
      callbacks?.onComplete?.();

      return {
        success: false,
        message: 'Drive operation failed',
        error: errorMessage
      };
    }
  }

  private async callBackendCanister(text: string): Promise<string> {
    const CANISTER_ID = process.env.EXPO_PUBLIC_ICP_MAINNET_CANISTER_ID_DRIVE_GACHA;
    
    if (!CANISTER_ID) {
      throw new Error('Drive gacha canister ID not configured');
    }

    // Get identity from AuthClient (same as Touch UI)
    const { AuthClient } = await import('@dfinity/auth-client');
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();

    // Create the agent
    const agent = new HttpAgent({
      identity,
      host: process.env.EXPO_PUBLIC_ICP_MAINNET_URL,
    });

    // Create the actor
    const actor: ActorSubclass = Actor.createActor(idlFactory, {
      agent: agent!,
      canisterId: CANISTER_ID,
    });

    // Call the gacha drive request function
    const result = await (actor as any).gacha_drive_request(text);
    return result;
  }

  private async startCountdown(callbacks?: DriveOperationCallbacks): Promise<void> {
    return new Promise((resolve) => {
      let seconds = 10;
      callbacks?.onCountdownUpdate?.(seconds);

      this.countdownTimer = setInterval(() => {
        seconds -= 1;
        callbacks?.onCountdownUpdate?.(seconds);
        
        if (seconds <= 0) {
          this.clearCountdown();
          this.isOperationInProgress = false;
          callbacks?.onComplete?.();
          resolve();
        }
      }, 1000);
    });
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  // Check if an operation is currently in progress
  isInProgress(): boolean {
    return this.isOperationInProgress;
  }

  // Cancel current operation (if needed)
  cancelOperation(): void {
    this.clearCountdown();
    this.isOperationInProgress = false;
  }

  // Get the current state for UI updates
  getOperationState(): {
    inProgress: boolean;
    hasCountdown: boolean;
  } {
    return {
      inProgress: this.isOperationInProgress,
      hasCountdown: this.countdownTimer !== null,
    };
  }
}

export default DriveOperationService;