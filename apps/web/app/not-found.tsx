import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { STRINGS } from '../content/strings';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-md w-full text-center p-6 space-y-4">
        <div className="flex justify-center text-amber-500">
          <AlertCircle className="w-12 h-12" />
        </div>
        <CardHeader className="p-0">
          <CardTitle className="text-xl font-bold">{STRINGS.common.notFoundTitle}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <p className="text-sm text-muted-foreground">{STRINGS.common.notFoundSubtitle}</p>
          <div>
            <Link href="/" passHref>
              <Button variant="default" className="w-full">
                {STRINGS.common.backToDashboard}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
