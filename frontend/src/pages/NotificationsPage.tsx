import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export default function NotificationsPage() {
  const { data = [] } = useQuery({ queryKey: ['notifications'], queryFn: api.notifications });
  return <><PageHeader title="Notifications" subtitle="WhatsApp, SMS, email, and in-app communication queue." /><Card><CardContent><Table><TableHead><TableRow><TableCell>Type</TableCell><TableCell>Channel</TableCell><TableCell>Recipient</TableCell><TableCell>Message</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{data.map((notification) => <TableRow key={notification.id}><TableCell>{notification.type}</TableCell><TableCell>{notification.channel}</TableCell><TableCell>{notification.recipient}</TableCell><TableCell>{notification.message}</TableCell><TableCell><Chip label={notification.status ?? 'QUEUED'} size="small" /></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></>;
}
