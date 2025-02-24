import React from "react";
import { Question } from "../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuestionStepProps {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

const QuestionStep = ({ question, value, onChange }: QuestionStepProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{question.title}</h2>
      {question.tip && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {question.tip}
        </p>
      )}

      <div className="mt-4">
        {question.type === "text" && (
          <Input
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            required={question.validation?.required}
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            required={question.validation?.required}
            min={question.validation?.min}
            max={question.validation?.max}
          />
        )}

        {question.type === "textarea" && (
          <Textarea
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            required={question.validation?.required}
          />
        )}

        {question.type === "select" && question.options && (
          <Select value={value as string} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === "radio" && question.options && (
          <RadioGroup value={value as string} onValueChange={onChange}>
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
      </div>
    </div>
  );
};

export default QuestionStep; 