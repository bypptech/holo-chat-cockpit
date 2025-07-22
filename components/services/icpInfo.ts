// ICP Explorer functionality
import i18n from '@/i18n';
export interface ICPInfo {
  principal?: string;
  network: {
    status: 'active' | 'inactive' | 'maintenance';
    name: string;
    connection: 'stable' | 'unstable' | 'disconnected';
    latency?: number;
  };
  canister?: {
    id: string;
    status: string;
    cycles?: bigint;
  };
}

export function getICPNetworkInfo(): ICPInfo['network'] {
  // In a real implementation, this would query the IC network
  return {
    status: 'active',
    name: 'Internet Computer',
    connection: 'stable',
    latency: Math.floor(Math.random() * 50) + 10 // Mock latency 10-60ms
  };
}

export function formatICPInfo(info: Partial<ICPInfo>, language?: 'ja' | 'en'): string {
  const lines: string[] = [];
  // Use i18n if no language specified, otherwise fallback to provided language
  const t = language ? 
    (key: string) => i18n.getFixedT(language)(`icp:${key.replace('icp:', '')}`) :
    (key: string) => i18n.t(`icp:${key.replace('icp:', '')}`);
  
  if (info.principal) {
    lines.push(`👤 ${t('principalId')}: ${info.principal.slice(0, 8)}...${info.principal.slice(-6)}`);
  }
  
  if (info.network) {
    lines.push(`🌐 ${t('networkInfo')}:`);
    
    const statusKey = info.network.status === 'active' ? 'active' 
      : info.network.status === 'maintenance' ? 'maintenance' 
      : 'inactive';
    lines.push(`  • ${t('status.label')}: ${t(`status.${statusKey}`)}`);
    
    lines.push(`  • ${t('network')}: ${info.network.name}`);
    
    const connectionKey = info.network.connection === 'stable' ? 'stable'
      : info.network.connection === 'unstable' ? 'unstable'
      : 'disconnected';
    lines.push(`  • ${t('connection.label')}: ${t(`connection.${connectionKey}`)}`);
    
    if (info.network.latency) {
      lines.push(`  • ${t('latency')}: ${info.network.latency}ms`);
    }
  }
  
  if (info.canister) {
    lines.push(`📦 ${t('canisterInfo')}:`);
    lines.push(`  • ID: ${info.canister.id}`);
    lines.push(`  • ${t('status.label')}: ${info.canister.status}`);
    if (info.canister.cycles) {
      lines.push(`  • ${t('cycles')}: ${info.canister.cycles.toLocaleString()}`);
    }
  }
  
  return lines.join('\n');
}

export function parseICPCommand(message: string, language: 'ja' | 'en'): {
  type: 'principal' | 'network' | 'canister' | 'all' | null;
  response?: string;
} {
  const lowerMessage = message.toLowerCase();
  
  // Principal commands
  if (lowerMessage.includes('principal') || 
      lowerMessage.includes('プリンシパル') ||
      lowerMessage.includes('id')) {
    return { type: 'principal' };
  }
  
  // Network commands
  if (lowerMessage.includes('network') || 
      lowerMessage.includes('ネットワーク') ||
      lowerMessage.includes('接続') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('status') ||
      lowerMessage.includes('ステータス')) {
    return { type: 'network' };
  }
  
  // Canister commands
  if (lowerMessage.includes('canister') || 
      lowerMessage.includes('キャニスター') ||
      lowerMessage.includes('コントラクト') ||
      lowerMessage.includes('contract')) {
    return { type: 'canister' };
  }
  
  // All info
  if (lowerMessage.includes('all') || 
      lowerMessage.includes('すべて') ||
      lowerMessage.includes('全部') ||
      lowerMessage.includes('info') ||
      lowerMessage.includes('情報')) {
    return { type: 'all' };
  }
  
  return { type: null };
}