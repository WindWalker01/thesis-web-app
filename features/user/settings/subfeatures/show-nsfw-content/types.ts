export type ShowNsfwContentResult =
    | {
          success: true;
          message: string;
          showNsfwContent: boolean;
      }
    | {
          success: false;
          message: string;
      };