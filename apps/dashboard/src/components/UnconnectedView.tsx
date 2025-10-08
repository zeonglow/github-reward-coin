import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Github } from 'lucide-react';

interface UnconnectedViewProps {
  onConnect: () => void;
}

export const UnconnectedView = ({ onConnect }: UnconnectedViewProps) => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <p className="text-gray-600">Your CodeKudos Coin (CKC) Rewards</p>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Github className="w-8 h-8 text-gray-600" />
            </div>
            
            <Button 
              onClick={onConnect}
              className="bg-gray-900 hover:bg-gray-800 text-white w-full"
              size="lg"
            >
              <Github className="w-5 h-5 mr-2" />
              Connect your Github account
            </Button>

            <div className="text-left space-y-3 pt-4">
              <p className="text-sm font-medium text-gray-700">What happens next:</p>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-medium text-blue-600 mr-2">1.</span>
                  <span>You will connect your github account</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-blue-600 mr-2">2.</span>
                  <span>You will get a new wallet</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-blue-600 mr-2">3.</span>
                  <span>You will be able to use different wallet address later on the setting</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-blue-600 mr-2">4.</span>
                  <span>All your commits reward will go to this wallet</span>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
