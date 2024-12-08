export interface AuditLogServiceInterface {
  /**
   * Mencatat aktivitas CRUD ke dalam tabel audit_log.
   * @param entity - Nama entitas
   * @param operation - Jenis operasi (CREATE, UPDATE, DELETE)
   * @param changes - Perubahan data
   * @returns Promise<void>
   */
  createAuditLog(
    entity: string,
    operation: string,
    changes: string,
  ): Promise<void>;
}
