package com.citidirect.cashstatement.dto;

public class DeliveryOptionRequest {
    private String channelType; // EMAIL, SFTP, PORTAL
    private String destinationTarget;
    private String sftpFolderPath;
    private String encryptionProtocol;
    private String sshKeyMethod;

    public DeliveryOptionRequest() {}

    public String getChannelType() { return channelType; }
    public void setChannelType(String channelType) { this.channelType = channelType; }

    public String getDestinationTarget() { return destinationTarget; }
    public void setDestinationTarget(String destinationTarget) { this.destinationTarget = destinationTarget; }

    public String getSftpFolderPath() { return sftpFolderPath; }
    public void setSftpFolderPath(String sftpFolderPath) { this.sftpFolderPath = sftpFolderPath; }

    public String getEncryptionProtocol() { return encryptionProtocol; }
    public void setEncryptionProtocol(String encryptionProtocol) { this.encryptionProtocol = encryptionProtocol; }

    public String getSshKeyMethod() { return sshKeyMethod; }
    public void setSshKeyMethod(String sshKeyMethod) { this.sshKeyMethod = sshKeyMethod; }
}
